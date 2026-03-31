# Created: 2026-03-24 22:22:13
import os
import time
import base64
import json
import re
import uuid
from datetime import datetime, timezone, timedelta
import requests
import bcrypt
import jwt
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
from database import init_db, create_user, get_user_by_email, get_user_by_id, \
    update_user_profile, get_saved_recipes, save_recipe, delete_saved_recipe

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemma-3-27b-it:free"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET 환경 변수가 설정되지 않았습니다. 서버를 시작하기 전에 반드시 설정해주세요.")
JWT_EXPIRE_DAYS = 7

init_db()


# ── 유틸 ──────────────────────────────────────────────

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def call_openrouter(messages, retries=3, delay=5):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    for attempt in range(retries):
        res = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json={"model": MODEL, "messages": messages},
            timeout=30,
        )
        if res.status_code == 429:
            if attempt < retries - 1:
                time.sleep(delay)
                continue
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]
    raise Exception("rate limit 초과: 잠시 후 다시 시도해주세요.")


def get_current_user():
    """Authorization 헤더에서 JWT를 검증하고 user dict 반환. 실패 시 None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return get_user_by_id(payload["sub"])
    except jwt.PyJWTError:
        return None


def make_token(user_id):
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ── 페이지 라우트 ──────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/recipes")
def recipes():
    return render_template("recipes.html")


@app.route("/auth")
def auth_page():
    return render_template("auth.html")


@app.route("/profile")
def profile_page():
    return render_template("profile.html")


# ── 인증 API ──────────────────────────────────────────

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    nickname = (data.get("nickname") or "").strip()

    if not email or not password or not nickname:
        return jsonify({"error": "이메일, 비밀번호, 닉네임을 모두 입력해주세요."}), 400
    if len(password) < 6:
        return jsonify({"error": "비밀번호는 6자 이상이어야 합니다."}), 400
    if get_user_by_email(email):
        return jsonify({"error": "이미 사용 중인 이메일입니다."}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    create_user(user_id, email, hashed, nickname, created_at)

    return jsonify({"user_id": user_id, "token": make_token(user_id)}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}), 401

    return jsonify({"user_id": user["id"], "token": make_token(user["id"])})


# ── 프로필 API ────────────────────────────────────────

@app.route("/api/profile", methods=["GET"])
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "인증이 필요합니다."}), 401
    return jsonify({
        "nickname": user["nickname"],
        "email": user["email"],
        "dietary_restrictions": json.loads(user["dietary_restrictions"]),
    })


@app.route("/api/profile", methods=["PATCH"])
def patch_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "인증이 필요합니다."}), 401

    data = request.get_json()
    if data is None:
        return jsonify({"error": "요청 본문이 올바르지 않습니다."}), 400
    nickname = data.get("nickname", user["nickname"]).strip()
    dietary_restrictions = data.get(
        "dietary_restrictions", json.loads(user["dietary_restrictions"])
    )
    update_user_profile(user["id"], nickname, dietary_restrictions)
    return jsonify({"ok": True})


# ── 저장 레시피 API ───────────────────────────────────

@app.route("/api/recipes/saved", methods=["GET"])
def list_saved():
    user = get_current_user()
    if not user:
        return jsonify({"error": "인증이 필요합니다."}), 401
    return jsonify({"recipes": get_saved_recipes(user["id"])})


@app.route("/api/recipes/saved", methods=["POST"])
def add_saved():
    user = get_current_user()
    if not user:
        return jsonify({"error": "인증이 필요합니다."}), 401

    recipe = request.get_json()
    if not recipe or not recipe.get("name"):
        return jsonify({"error": "레시피 데이터가 올바르지 않습니다."}), 400

    recipe_id = str(uuid.uuid4())
    saved_at = datetime.now(timezone.utc).isoformat()
    ok = save_recipe(recipe_id, user["id"], recipe, saved_at)
    if not ok:
        return jsonify({"error": "이미 저장된 레시피이거나 저장 한도(100개)를 초과했습니다."}), 409
    return jsonify({"ok": True, "id": recipe_id}), 201


@app.route("/api/recipes/saved/<recipe_id>", methods=["DELETE"])
def remove_saved(recipe_id):
    user = get_current_user()
    if not user:
        return jsonify({"error": "인증이 필요합니다."}), 401
    deleted = delete_saved_recipe(recipe_id, user["id"])
    if not deleted:
        return jsonify({"error": "레시피를 찾을 수 없거나 삭제 권한이 없습니다."}), 404
    return jsonify({"ok": True})


# ── 이미지 분석 API ───────────────────────────────────

@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "이미지 파일이 없습니다."}), 400

    file = request.files["image"]
    if not allowed_file(file.filename):
        return jsonify({"error": "JPG, PNG, WEBP 형식만 지원합니다."}), 400

    image_data = base64.b64encode(file.read()).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    data_url = f"data:{mime};base64,{image_data}"

    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": data_url}},
                {
                    "type": "text",
                    "text": (
                        "이 냉장고 이미지에서 식재료를 모두 찾아줘.\n"
                        "반드시 아래 JSON 형식으로만 응답해:\n"
                        '{"ingredients": ["재료1", "재료2", ...]}'
                    ),
                },
            ],
        }
    ]

    try:
        raw = call_openrouter(messages)
    except Exception:
        return jsonify({"error": "AI 서비스 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}), 500

    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return jsonify({"error": "이미지를 인식할 수 없습니다."}), 500
        result = json.loads(match.group())
        return jsonify({"ingredients": result.get("ingredients", [])})
    except Exception:
        return jsonify({"error": "응답을 처리하는 중 오류가 발생했습니다."}), 500


# ── 레시피 생성 API ───────────────────────────────────

@app.route("/api/recipes", methods=["POST"])
def get_recipes():
    data = request.get_json()
    ingredients = data.get("ingredients", [])
    if not ingredients:
        return jsonify({"error": "재료 목록이 없습니다."}), 400

    # 로그인한 사용자의 식이 제한 반영
    user = get_current_user()
    dietary_note = ""
    if user:
        restrictions = json.loads(user["dietary_restrictions"])
        if restrictions:
            dietary_note = f" (식이 제한: {', '.join(restrictions)})"

    ingredient_str = ", ".join(ingredients)
    prompt = (
        f"다음 재료로 만들 수 있는 요리를 3가지 추천해줘{dietary_note}: {ingredient_str}\n"
        "반드시 아래 JSON 형식으로만 응답해:\n"
        '{"recipes": [{"name": "요리명", "time": "조리 시간(분)", "difficulty": "쉬움|보통|어려움", '
        '"ingredients": ["재료1(양)", ...], "steps": ["1. ...", "2. ..."]}]}'
    )

    messages = [{"role": "user", "content": prompt}]

    try:
        raw = call_openrouter(messages)
    except Exception:
        return jsonify({"error": "AI 서비스 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}), 500

    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return jsonify({"error": "레시피를 생성할 수 없습니다."}), 500
        result = json.loads(match.group())
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "응답 파싱에 실패했습니다. 다시 시도해주세요."}), 500
    except Exception:
        return jsonify({"error": "응답을 처리하는 중 오류가 발생했습니다."}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
