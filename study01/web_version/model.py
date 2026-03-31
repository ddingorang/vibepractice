# Created: 2026-03-19 16:44:36
import os
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from PIL import Image, ImageOps, ImageFilter
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "mnist_cnn.pt")
DATA_PATH  = os.path.join(os.path.dirname(__file__), "mnist_data")


class DigitCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.block1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.Conv2d(32, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2), nn.Dropout2d(0.25),
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2), nn.Dropout2d(0.25),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 7 * 7, 256), nn.BatchNorm1d(256), nn.ReLU(),
            nn.Dropout(0.5), nn.Linear(256, 10),
        )

    def forward(self, x):
        return self.classifier(self.block2(self.block1(x)))


def train_model(status_cb=None, progress_cb=None):
    def status(msg):
        if status_cb: status_cb(msg)

    def progress(pct):
        if progress_cb: progress_cb(pct)

    device = torch.device("cpu")
    model = DigitCNN().to(device)

    if os.path.exists(MODEL_PATH):
        status("캐시된 모델을 불러오는 중…")
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
        progress(100)
        status("모델 준비 완료! 숫자를 그려보세요.")
        return model

    train_transform = transforms.Compose([
        transforms.RandomAffine(degrees=15, translate=(0.1, 0.1), scale=(0.9, 1.1), shear=5),
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,)),
    ])

    status("MNIST 데이터셋 다운로드 중…")
    train_set = torchvision.datasets.MNIST(root=DATA_PATH, train=True, download=True, transform=train_transform)
    train_loader = torch.utils.data.DataLoader(train_set, batch_size=128, shuffle=True, num_workers=0)

    optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()
    epochs = 15
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            loss = criterion(model(images), labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            pct = ((epoch - 1) + (batch_idx + 1) / len(train_loader)) / epochs * 100
            progress(pct)
        scheduler.step()
        avg_loss = total_loss / len(train_loader)
        status(f"Epoch {epoch}/{epochs}  loss={avg_loss:.4f}")

    torch.save(model.state_dict(), MODEL_PATH)
    status("학습 완료! 숫자를 그려보세요.")
    model.eval()
    return model


def preprocess(pil_image):
    img = pil_image.convert("L")
    img = ImageOps.invert(img)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))
    arr = np.array(img)

    rows = np.any(arr > 20, axis=1)
    cols = np.any(arr > 20, axis=0)

    if not rows.any():
        blank = (np.zeros((28, 28), dtype=np.float32) - 0.1307) / 0.3081
        return torch.tensor(blank).unsqueeze(0).unsqueeze(0)

    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]
    cropped = arr[r0:r1 + 1, c0:c1 + 1]

    h, w = cropped.shape
    scale = 20.0 / max(h, w)
    new_h, new_w = max(1, int(h * scale)), max(1, int(w * scale))
    digit_img = Image.fromarray(cropped).resize((new_w, new_h), Image.LANCZOS)

    frame = Image.new("L", (28, 28), 0)
    frame.paste(digit_img, ((28 - new_w) // 2, (28 - new_h) // 2))

    result = (np.array(frame, dtype=np.float32) / 255.0 - 0.1307) / 0.3081
    return torch.tensor(result).unsqueeze(0).unsqueeze(0)
