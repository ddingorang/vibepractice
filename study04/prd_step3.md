# Created: 2026-03-24 22:10:26
# PRD Step 3 — 사용자 프로필 및 레시피 저장

## 목표
사용자 프로필을 생성하고, Step 2에서 생성된 레시피를 저장·관리할 수 있는 개인화 기능을 제공한다.

## 사용자 스토리
- 사용자는 회원가입/로그인하여 개인 프로필을 만든다.
- 사용자는 마음에 드는 레시피를 저장해 나중에 다시 확인할 수 있다.
- 사용자는 저장된 레시피 목록을 조회하고 삭제할 수 있다.

## 기능 요구사항

### 사용자 인증
- 이메일 + 비밀번호 기반 회원가입 / 로그인
- 로그인 상태는 JWT 토큰으로 유지 (localStorage 저장)
- 비로그인 상태에서도 Step 1~2 사용 가능, 저장 시점에 로그인 유도

### 사용자 프로필
- 닉네임, 프로필 이미지(선택) 설정
- 식이 제한 정보 입력 (예: 채식, 글루텐 프리 등) — Step 2 레시피 생성 프롬프트에 반영
- 프로필 수정 페이지 제공

### 레시피 저장
- Step 2 상세 화면의 "저장하기" 버튼 클릭 시 서버에 저장
- 저장 항목: 요리명, 조리 시간, 난이도, 재료 목록, 조리 단계, 저장 일시
- 동일 레시피 중복 저장 방지 (요리명 기준)

### 저장된 레시피 목록
- 저장 일시 기준 최신순 정렬
- 카드 형태로 표시 (요리명, 저장 날짜)
- 카드 클릭 시 레시피 상세 확인
- 삭제 버튼으로 개별 레시피 제거

## 화면 구성
```
┌─────────────────────────────────┐
│  👤 내 프로필                    │
│  닉네임: 홍길동                  │
│  식이 제한: 없음                 │    [프로필 수정]
│                                 │
│  📚 저장된 레시피 (3)            │
│  ┌──────────────────────────┐  │
│  │ 달걀볶음밥    2026-03-24  │  │
│  │ 야채오믈렛    2026-03-23  │  │
│  │ 당근수프      2026-03-22  │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## 데이터 모델

### User
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| email | string | 로그인 이메일 |
| password | string | bcrypt 해시 |
| nickname | string | 표시 이름 |
| dietary_restrictions | string[] | 식이 제한 목록 |
| created_at | datetime | 가입일 |

### SavedRecipe
| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| user_id | string | User 외래키 |
| name | string | 요리명 |
| time | string | 조리 시간 |
| difficulty | string | 난이도 |
| ingredients | string[] | 재료 목록 |
| steps | string[] | 조리 단계 |
| saved_at | datetime | 저장 일시 |

## API 명세

### POST /api/auth/register
- Request: `{ email, password, nickname }`
- Response: `{ user_id, token }`

### POST /api/auth/login
- Request: `{ email, password }`
- Response: `{ user_id, token }`

### GET /api/profile
- Header: `Authorization: Bearer {token}`
- Response: `{ nickname, dietary_restrictions }`

### PATCH /api/profile
- Header: `Authorization: Bearer {token}`
- Request: `{ nickname?, dietary_restrictions? }`

### GET /api/recipes/saved
- Header: `Authorization: Bearer {token}`
- Response: `{ recipes: [...] }`

### POST /api/recipes/saved
- Header: `Authorization: Bearer {token}`
- Request: recipe 객체 (Step 2 응답 형식)

### DELETE /api/recipes/saved/:id
- Header: `Authorization: Bearer {token}`

## 비기능 요구사항
- 비밀번호는 bcrypt로 해시하여 저장
- JWT 만료 시간: 7일
- 저장된 레시피는 사용자당 최대 100개 제한
