# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

손글씨 숫자 인식기 (MNIST CNN 기반). 웹 버전과 데스크톱 버전으로 나뉘어 개발 중.

```
study01/
├── digit_recognizer.py   # 원본 단일 파일 버전 (레퍼런스용)
├── web_version/          # FastAPI + HTML5 Canvas 웹 버전
└── desktop_version/      # Tkinter 데스크톱 버전 (model/GUI 분리)
```

각 버전의 개발 가이드는 해당 폴더의 `CLAUDE.md` 참조.

## 공통 ML 코어

두 버전 모두 동일한 모델 구조와 전처리 로직을 사용한다 (`model.py`).

**`DigitCNN`** — 2-block CNN (BatchNorm + Dropout). 입력 1×28×28, 출력 10 logits.

**`train_model(status_cb, progress_cb)`** — MNIST 15 epoch 학습 (Adam lr=1e-3, CosineAnnealingLR, 데이터 증강: 회전 ±15°, affine). `mnist_cnn.pt` 캐시 존재 시 즉시 로드.

**`preprocess(pil_image)`** — PIL → 1×1×28×28 tensor. 그레이스케일 → 반전 → 가우시안 블러 → 바운딩박스 크롭 → 20×20 리사이즈 → 28×28 중앙 배치 → 정규화 (mean=0.1307, std=0.3081).

## 원본 버전 실행

```bash
pip install torch torchvision pillow numpy
python digit_recognizer.py
```
