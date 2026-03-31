# Created: 2026-03-19 22:00:57
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 컨텍스트

이 디렉토리는 vibecoding 학습 시리즈의 **study03**이다. 현재 비어 있으며, 새로운 프로젝트가 진행될 예정이다.

### 시리즈 구조

```
vibecoding/
├── study01/    # 손글씨 숫자 인식기 (MNIST CNN) — FastAPI 웹 + Tkinter 데스크톱
└── study02/    # Todo 앱 — Vanilla JS + localStorage (프론트엔드 전용)
```

## study01에서 확립된 패턴 (레퍼런스)

새 ML/웹 프로젝트를 시작할 때 study01의 구조를 참고할 것.

**ML 코어 분리**: `model.py`에 모델 정의(`DigitCNN`), 학습(`train_model(status_cb, progress_cb)`), 전처리(`preprocess()`)를 분리. 웹/데스크톱 양쪽에서 동일 파일 사용.

**FastAPI 웹 패턴**:
```bash
pip install fastapi uvicorn torch torchvision pillow numpy python-multipart
uvicorn app:app --reload  # http://localhost:8000
```
- `app.py`: FastAPI 앱, 정적 파일 서빙, 예측 엔드포인트
- `static/`: index.html + app.js + style.css (Vanilla JS, 프레임워크 없음)

**Tkinter 데스크톱 패턴**:
```bash
pip install torch torchvision pillow numpy
python main.py
```
- 학습은 `threading.Thread`로 백그라운드 실행
- UI 업데이트는 콜백(`status_cb`, `progress_cb`)을 통해 분리

**모델 캐싱**: `mnist_cnn.pt` — 파일 존재 시 즉시 로드, 없으면 학습 후 저장.

퀴즈 문제 교차 검증 가이드라인
모든 문제 작성 시 확인 사항
1. 정답이 하나뿐인가? : 다른 해석 가능 시 조건 명시(예:면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가? : '가장 큰', '최초의' 등 표현에 측정 기준 명시
3. 시간과 범위가 명확한가? : 변할 수 있는 정보는 시점 명시, 지리적 분류적 범위 한정
4. 교차 검증했는가? : 의심스러운 정보는 2개 이상 출처 확인, 논란 있는 내용은 주류 학설 기준
