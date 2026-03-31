# Created: 2026-03-30 21:49:46
---
name: 냉장고를 부탁해 프로젝트 개요
description: study04 프로젝트의 기술 스택, 보안/성능 수정 이력
type: project
---

냉장고 이미지를 업로드하면 AI가 재료를 인식하고 레시피를 추천하는 Flask 웹앱.

**스택:** Python/Flask, SQLite, PyJWT, bcrypt, OpenRouter API (google/gemma-3-27b-it:free), Vanilla JS 프론트엔드

**수정 이력 (2026-03-30):**
- JWT_SECRET: 환경 변수 미설정 시 ValueError raise (기본값 하드코딩 제거)
- analyze/get_recipes: call_openrouter 예외 처리 분리 → raw 변수 NameError 방지 + str(e) 에러 노출 제거
- patch_profile: request.get_json() None 방어 추가
- register: 서버 측 비밀번호 6자 이상 검증 추가
- delete_saved_recipe: rowcount 확인 후 bool 반환, app.py에서 404 처리
- saved_recipes 테이블: user_id 인덱스 추가
- fetchRecipes: Authorization Bearer 헤더 추가 (식이 제한 기능 작동)
- XSS: index.html, recipes.html, profile.html 전체 innerHTML → createElement/textContent
- Object URL 누수: index.html revokeObjectURL 추가
- Open Redirect: auth.html redirect 파라미터 같은 오리진 경로만 허용

**Why:** 코드 리뷰에서 발견된 치명/높음/중간/낮음 등급 이슈 11개 일괄 수정
**How to apply:** 향후 추가 기능 개발 시 이 패턴들을 기준으로 검토
