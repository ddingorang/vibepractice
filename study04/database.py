# Created: 2026-03-24 22:21:39
import sqlite3
import json
from contextlib import contextmanager

DB_PATH = "app.db"


def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id        TEXT PRIMARY KEY,
                email     TEXT UNIQUE NOT NULL,
                password  TEXT NOT NULL,
                nickname  TEXT NOT NULL,
                dietary_restrictions TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS saved_recipes (
                id         TEXT PRIMARY KEY,
                user_id    TEXT NOT NULL,
                name       TEXT NOT NULL,
                time       TEXT,
                difficulty TEXT,
                ingredients TEXT NOT NULL DEFAULT '[]',
                steps       TEXT NOT NULL DEFAULT '[]',
                saved_at   TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
            CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id
                ON saved_recipes (user_id);
        """)


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def create_user(user_id, email, hashed_pw, nickname, created_at):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO users (id, email, password, nickname, created_at) VALUES (?,?,?,?,?)",
            (user_id, email, hashed_pw, nickname, created_at),
        )


def get_user_by_email(email):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        return dict(row) if row else None


def get_user_by_id(user_id):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        return dict(row) if row else None


def update_user_profile(user_id, nickname, dietary_restrictions):
    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET nickname=?, dietary_restrictions=? WHERE id=?",
            (nickname, json.dumps(dietary_restrictions, ensure_ascii=False), user_id),
        )


def get_saved_recipes(user_id):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM saved_recipes WHERE user_id=? ORDER BY saved_at DESC",
            (user_id,),
        ).fetchall()
        result = []
        for row in rows:
            r = dict(row)
            r["ingredients"] = json.loads(r["ingredients"])
            r["steps"] = json.loads(r["steps"])
            result.append(r)
        return result


def save_recipe(recipe_id, user_id, recipe, saved_at):
    with get_conn() as conn:
        # 중복 방지 (요리명 기준)
        exists = conn.execute(
            "SELECT id FROM saved_recipes WHERE user_id=? AND name=?",
            (user_id, recipe["name"]),
        ).fetchone()
        if exists:
            return False
        # 사용자당 최대 100개
        count = conn.execute(
            "SELECT COUNT(*) FROM saved_recipes WHERE user_id=?", (user_id,)
        ).fetchone()[0]
        if count >= 100:
            return False
        conn.execute(
            "INSERT INTO saved_recipes (id, user_id, name, time, difficulty, ingredients, steps, saved_at) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (
                recipe_id,
                user_id,
                recipe["name"],
                recipe.get("time", ""),
                recipe.get("difficulty", ""),
                json.dumps(recipe.get("ingredients", []), ensure_ascii=False),
                json.dumps(recipe.get("steps", []), ensure_ascii=False),
                saved_at,
            ),
        )
        return True


def delete_saved_recipe(recipe_id, user_id):
    with get_conn() as conn:
        cursor = conn.execute(
            "DELETE FROM saved_recipes WHERE id=? AND user_id=?",
            (recipe_id, user_id),
        )
        return cursor.rowcount > 0
