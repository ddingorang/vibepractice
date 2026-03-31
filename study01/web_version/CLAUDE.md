# Created: 2026-03-19 16:39:57
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

손글씨 숫자 인식기의 **웹 버전**. 브라우저에서 캔버스에 숫자를 그리면 서버가 예측 결과를 반환한다.

- **Backend:** Python (FastAPI) — MNIST 모델 로드 및 `/predict` API 제공
- **Frontend:** HTML5 Canvas + Vanilla JS — 그리기 인터페이스 및 결과 시각화

## 실행 방법

```bash
# 의존성 설치
pip install fastapi uvicorn torch torchvision pillow numpy python-multipart

# 서버 실행
uvicorn app:app --reload

# 브라우저에서 열기: http://localhost:8000
```

## 아키텍처

```
web_version/
├── app.py          # FastAPI 앱 — /predict 엔드포인트, 정적 파일 서빙
├── model.py        # DigitCNN 정의 + train_model() + preprocess()
├── static/
│   ├── index.html  # 메인 페이지 (캔버스 + 결과 표시)
│   ├── app.js      # 캔버스 드로잉, fetch /predict, confidence bars 렌더링
│   └── style.css   # 스타일
└── mnist_cnn.pt    # 학습된 모델 (첫 실행 시 자동 생성)
```

### 핵심 흐름

1. 사용자가 브라우저 캔버스에 숫자를 그림
2. `app.js`가 캔버스를 PNG blob으로 변환해 `POST /predict`로 전송
3. `app.py`가 이미지를 받아 `model.preprocess()` → 모델 추론 → JSON 반환
   ```json
   { "digit": 7, "confidence": 98.3, "probabilities": [0.0, ..., 0.983, ...] }
   ```
4. `app.js`가 결과를 받아 예측 숫자와 confidence bars를 업데이트

### model.py (공유 로직)

`desktop_version/model.py`와 동일한 `DigitCNN`, `train_model()`, `preprocess()` 코드를 사용한다. 두 버전 간에 모델 파일(`mnist_cnn.pt`)은 공유하지 않고 각자 독립적으로 관리한다.

### 전처리 (preprocess)

서버에서 수행. 클라이언트가 보낸 PNG를 PIL로 열어 MNIST 형식(1×28×28, 정규화)으로 변환:
- 그레이스케일 변환 → 색 반전 → 가우시안 블러 → 바운딩박스 크롭 → 20×20 리사이즈 → 28×28 프레임 중앙 배치 → 정규화 (mean=0.1307, std=0.3081)
