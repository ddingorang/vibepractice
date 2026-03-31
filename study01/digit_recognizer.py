"""
Handwritten Digit Recognizer (improved accuracy)
Improvements over v1:
  - Deeper CNN with BatchNorm
  - Data augmentation (rotation, affine shifts) to bridge canvas ↔ MNIST gap
  - 15 epochs + CosineAnnealingLR scheduler
  - MNIST-style preprocessing: crop bounding box → center in 28×28 frame
  - Model cached to disk so training only runs once
"""

import tkinter as tk
from tkinter import ttk
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from PIL import Image, ImageDraw, ImageOps, ImageFilter
import numpy as np
import threading
import os

MODEL_PATH = "./mnist_cnn.pt"

# ─── Model ───────────────────────────────────────────────────────────────────

class DigitCNN(nn.Module):
    """
    Deeper CNN with BatchNorm for stable training.
    Architecture: two conv blocks → FC head
    """

    def __init__(self):
        super().__init__()
        self.block1 = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),       # → 14×14
            nn.Dropout2d(0.25),
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),       # → 7×7
            nn.Dropout2d(0.25),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 7 * 7, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 10),
        )

    def forward(self, x):
        return self.classifier(self.block2(self.block1(x)))


# ─── Training ────────────────────────────────────────────────────────────────

def train_model(status_cb, progress_cb):
    """
    Train on MNIST with data augmentation.
    Saves the model to MODEL_PATH and returns it.
    If a cached model exists, loads and returns it immediately.
    """
    device = torch.device("cpu")
    model = DigitCNN().to(device)

    # ── Use cached model if available ──────────────────────────────────
    if os.path.exists(MODEL_PATH):
        status_cb("Loading cached model…")
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        model.eval()
        progress_cb(100)
        status_cb("Model loaded! Draw a digit below.")
        return model

    # ── Data augmentation to reduce canvas ↔ MNIST domain gap ─────────
    # Random rotation ±15°, slight affine shift, elastic-like zoom
    train_transform = transforms.Compose([
        transforms.RandomAffine(
            degrees=15,
            translate=(0.1, 0.1),
            scale=(0.9, 1.1),
            shear=5,
        ),
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,)),
    ])

    status_cb("Downloading MNIST dataset…")
    train_set = torchvision.datasets.MNIST(
        root="./mnist_data", train=True, download=True, transform=train_transform
    )
    train_loader = torch.utils.data.DataLoader(
        train_set, batch_size=128, shuffle=True, num_workers=0
    )

    optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    # CosineAnnealingLR gradually reduces LR for better convergence
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
            progress_cb(pct)

        scheduler.step()
        avg_loss = total_loss / len(train_loader)
        lr = scheduler.get_last_lr()[0]
        status_cb(f"Epoch {epoch}/{epochs}  loss={avg_loss:.4f}  lr={lr:.5f}")

    torch.save(model.state_dict(), MODEL_PATH)
    status_cb("Training complete! Model saved. Draw a digit below.")
    model.eval()
    return model


# ─── Preprocessing ───────────────────────────────────────────────────────────

def preprocess(pil_image):
    """
    Convert a drawn PIL image to a normalised 1×28×28 tensor.

    Mimics MNIST preprocessing:
      1. Convert to grayscale and invert (white pen on black bg → black on white)
      2. Slight Gaussian blur to smooth aliased strokes
      3. Crop tight bounding box of the digit
      4. Pad to a square with margin, then resize to 20×20
      5. Paste centred into a 28×28 black frame (MNIST-style layout)
      6. Normalise with MNIST mean/std
    """
    img = pil_image.convert("L")           # grayscale

    # Invert: canvas has white strokes on black → we want black digit on white
    img = ImageOps.invert(img)

    # Light blur to smooth jagged edges from mouse drawing
    img = img.filter(ImageFilter.GaussianBlur(radius=1))

    arr = np.array(img)

    # ── Find bounding box of drawn pixels (threshold at 20/255) ────────
    rows = np.any(arr > 20, axis=1)
    cols = np.any(arr > 20, axis=0)

    if not rows.any():
        # Canvas is empty — return a blank tensor
        blank = np.zeros((28, 28), dtype=np.float32)
        blank = (blank - 0.1307) / 0.3081
        return torch.tensor(blank).unsqueeze(0).unsqueeze(0)

    r0, r1 = np.where(rows)[0][[0, -1]]
    c0, c1 = np.where(cols)[0][[0, -1]]

    cropped = arr[r0:r1 + 1, c0:c1 + 1]

    # ── Scale cropped digit so the longer side = 20px, keep aspect ratio ─
    h, w = cropped.shape
    scale = 20.0 / max(h, w)
    new_h, new_w = max(1, int(h * scale)), max(1, int(w * scale))

    digit_img = Image.fromarray(cropped).resize((new_w, new_h), Image.LANCZOS)

    # ── Paste centred into 28×28 frame ─────────────────────────────────
    frame = Image.new("L", (28, 28), 0)
    paste_x = (28 - new_w) // 2
    paste_y = (28 - new_h) // 2
    frame.paste(digit_img, (paste_x, paste_y))

    result = np.array(frame, dtype=np.float32) / 255.0
    result = (result - 0.1307) / 0.3081
    return torch.tensor(result).unsqueeze(0).unsqueeze(0)   # [1,1,28,28]


# ─── GUI ─────────────────────────────────────────────────────────────────────

class App:
    CANVAS_SIZE = 280   # pixels (10× MNIST resolution)
    BRUSH_RADIUS = 14

    def __init__(self, root):
        self.root = root
        self.root.title("Handwritten Digit Recognizer")
        self.root.resizable(False, False)
        self.model = None
        self._build_ui()
        threading.Thread(target=self._train, daemon=True).start()

    # ── UI layout ──────────────────────────────────────────────────────

    def _build_ui(self):
        pad = dict(padx=10, pady=6)

        tk.Label(self.root, text="Handwritten Digit Recognizer",
                 font=("Helvetica", 16, "bold")).pack(**pad)

        self.status_var = tk.StringVar(value="Initializing…")
        tk.Label(self.root, textvariable=self.status_var,
                 font=("Helvetica", 11), fg="#444").pack()

        self.progress_var = tk.DoubleVar(value=0)
        self.progress_bar = ttk.Progressbar(
            self.root, variable=self.progress_var, maximum=100, length=300
        )
        self.progress_bar.pack(**pad)

        self.canvas = tk.Canvas(
            self.root,
            width=self.CANVAS_SIZE, height=self.CANVAS_SIZE,
            bg="black", cursor="crosshair",
        )
        self.canvas.pack(**pad)
        self.canvas.bind("<B1-Motion>", self._on_draw)
        self.canvas.bind("<ButtonRelease-1>", self._on_release)

        self.pil_img = Image.new("RGB", (self.CANVAS_SIZE, self.CANVAS_SIZE), "black")
        self.pil_draw = ImageDraw.Draw(self.pil_img)

        self.pred_var = tk.StringVar(value="—")
        tk.Label(self.root, textvariable=self.pred_var,
                 font=("Helvetica", 72, "bold"), fg="#00cc44",
                 width=3, anchor="center").pack(**pad)

        # 0–9 confidence bars
        self.conf_frame = tk.Frame(self.root)
        self.conf_frame.pack(**pad)
        self.conf_bars = []
        for i in range(10):
            col = tk.Frame(self.conf_frame)
            col.pack(side="left", padx=3)
            bar = tk.Canvas(col, width=24, height=100, bg="#eee")
            bar.pack()
            tk.Label(col, text=str(i), font=("Helvetica", 10)).pack()
            self.conf_bars.append(bar)

        btn_frame = tk.Frame(self.root)
        btn_frame.pack(**pad)
        tk.Button(btn_frame, text="Clear", width=10,
                  command=self._clear).pack(side="left", padx=4)
        tk.Button(btn_frame, text="Predict", width=10,
                  command=self._predict).pack(side="left", padx=4)
        tk.Button(btn_frame, text="Retrain", width=10,
                  command=self._retrain).pack(side="left", padx=4)

    # ── Training ───────────────────────────────────────────────────────

    def _train(self):
        def set_status(msg):
            self.root.after(0, lambda: self.status_var.set(msg))
        def set_progress(pct):
            self.root.after(0, lambda: self.progress_var.set(pct))

        self.model = train_model(set_status, set_progress)
        self.root.after(0, self.progress_bar.pack_forget)

    def _retrain(self):
        """Delete cached model and retrain from scratch."""
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        self.model = None
        self.progress_bar.pack(padx=10, pady=6)
        self.progress_var.set(0)
        threading.Thread(target=self._train, daemon=True).start()

    # ── Drawing ────────────────────────────────────────────────────────

    def _on_draw(self, event):
        r = self.BRUSH_RADIUS
        x0, y0, x1, y1 = event.x - r, event.y - r, event.x + r, event.y + r
        self.canvas.create_oval(x0, y0, x1, y1, fill="white", outline="white")
        self.pil_draw.ellipse([x0, y0, x1, y1], fill="white")

    def _on_release(self, _event):
        if self.model is not None:
            self._predict()

    # ── Prediction ─────────────────────────────────────────────────────

    def _predict(self):
        if self.model is None:
            self.status_var.set("Model is still training, please wait…")
            return

        tensor = preprocess(self.pil_img)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze().numpy()

        predicted = int(np.argmax(probs))
        confidence = probs[predicted] * 100

        self.pred_var.set(str(predicted))
        self.status_var.set(f"Predicted: {predicted}  ({confidence:.1f}% confident)")

        for i, bar in enumerate(self.conf_bars):
            bar.delete("all")
            h = int(probs[i] * 100)
            color = "#00cc44" if i == predicted else "#4488ff"
            bar.create_rectangle(0, 100 - h, 24, 100, fill=color, outline="")

    # ── Clear ──────────────────────────────────────────────────────────

    def _clear(self):
        self.canvas.delete("all")
        self.pil_img = Image.new("RGB", (self.CANVAS_SIZE, self.CANVAS_SIZE), "black")
        self.pil_draw = ImageDraw.Draw(self.pil_img)
        self.pred_var.set("—")
        self.status_var.set("Canvas cleared. Draw a digit!")
        for bar in self.conf_bars:
            bar.delete("all")


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
