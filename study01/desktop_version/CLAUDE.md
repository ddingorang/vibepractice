# Created: 2026-03-19 16:40:14
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

손글씨 숫자 인식기의 **데스크톱 버전**. Tkinter GUI로 숫자를 그리면 로컬에서 즉시 예측한다. 기존 `digit_recognizer.py`를 역할별로 분리·리팩터링한 버전.

- **GUI:** Python Tkinter
- **ML:** PyTorch CNN (MNIST 학습)

## 실행 방법

```bash
# 의존성 설치
pip install torch torchvision pillow numpy

# 실행
python main.py
```

## 아키텍처

```
desktop_version/
├── main.py     # 진입점 — Tk 루트 생성 후 App 실행
├── model.py    # DigitCNN 정의 + train_model() + preprocess()
├── app.py      # App 클래스 — Tkinter GUI 전체
└── mnist_cnn.pt  # 학습된 모델 (첫 실행 시 자동 생성)
```

### 파일별 역할

**`model.py`** — ML 코어. GUI에 의존하지 않음.
- `DigitCNN`: 2-block CNN (BatchNorm, Dropout). 입력 1×28×28, 출력 10 logits.
- `train_model(status_cb, progress_cb)`: MNIST 15 epoch 학습 (Adam lr=1e-3, CosineAnnealingLR). `mnist_cnn.pt` 캐시가 있으면 즉시 로드.
- `preprocess(pil_image)`: PIL 이미지 → 1×1×28×28 tensor. 그레이스케일 → 반전 → 블러 → 바운딩박스 크롭 → 20×20 → 28×28 중앙 배치 → 정규화.

**`app.py`** — Tkinter GUI.
- 캔버스: 280×280px, 브러시 반경 14px (흰색 획, 검정 배경)
- 위젯: 상태바, 프로그레스바, 예측 숫자 (녹색 72pt), 0~9 confidence bar, Clear/Predict/Retrain 버튼
- 학습은 백그라운드 스레드에서 실행 (`threading.Thread`)
- 마우스 버튼을 뗄 때 자동 예측 (`<ButtonRelease-1>`)

**`main.py`** — `Tk()` 생성 후 `App(root)` 호출, `mainloop()` 실행.

### 원본과의 차이

기존 `digit_recognizer.py`는 단일 파일. 이 버전은 model/GUI를 분리해 `model.py`를 웹 버전과 구조적으로 동일하게 유지한다.
