# Created: 2026-03-30 21:53:25
---
name: 냉장고를 부탁해 앱 UX 개선 이력
description: 냉장고 재료 인식 레시피 추천 앱의 템플릿 UX 개선 작업 내용
type: project
---

이 프로젝트는 냉장고 사진으로 재료를 인식하고 레시피를 추천하는 앱이다.
템플릿 파일: auth.html, index.html, recipes.html, profile.html

개선 완료 항목 (2026-03-30):
- auth.html: 회원가입 폼에 비밀번호 확인 필드 추가, 실시간 불일치 감지
- index.html: 로그인 상태에 따른 우측 상단 네비게이션 링크 추가 (내 프로필 / 로그인), 분석 실패 시 "다시 시도하기" 버튼 추가 (파일 재선택 불필요)
- recipes.html: 다시 추천받기/저장하기 버튼 중복 클릭 방지 (disabled + 로딩 텍스트), pendingRecipe 로그인 후 자동 저장 처리, ESC 키 모달 닫기, alert 대신 토스트 피드백
- profile.html: 저장 버튼 API 결과에 따른 토스트 피드백 (성공/실패 구분), ESC 키 모달 닫기, closeModal 함수 분리

**Why:** 중복 제출, 실패 후 재시도 불편, 피드백 부재 등 기본 UX 문제가 있었다.
**How to apply:** 동일 패턴의 버튼/모달 컴포넌트에는 같은 방식으로 disabled + toast 패턴을 적용한다.
