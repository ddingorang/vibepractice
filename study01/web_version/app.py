# Created: 2026-03-19 16:44:45
import io
import threading
import numpy as np
import torch
from PIL import Image
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from model import train_model, preprocess

# ── Global state ──────────────────────────────────────────────────────────────

model = None
training_status = "서버 시작 중…"
training_progress = 0.0


def _on_status(msg: str):
    global training_status
    training_status = msg


def _on_progress(pct: float):
    global training_progress
    training_progress = pct


def _train():
    global model
    model = train_model(status_cb=_on_status, progress_cb=_on_progress)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=_train, daemon=True).start()
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(lifespan=lifespan)


@app.get("/status")
def get_status():
    return {
        "status": training_status,
        "progress": training_progress,
        "ready": model is not None,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return JSONResponse({"error": "모델 준비 중입니다. 잠시 후 다시 시도하세요."}, status_code=503)

    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    tensor = preprocess(img)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).squeeze().numpy()

    predicted = int(np.argmax(probs))
    return {
        "digit": predicted,
        "confidence": float(probs[predicted] * 100),
        "probabilities": probs.tolist(),
    }


# Static files (must be mounted last)
app.mount("/", StaticFiles(directory="static", html=True), name="static")
