# Created: 2026-03-24 22:02:04
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}


def test_text(model: str, prompt: str) -> str:
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    }
    res = requests.post(BASE_URL, headers=HEADERS, json=payload)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


def test_image(model: str, image_url: str, prompt: str) -> str:
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }
    res = requests.post(BASE_URL, headers=HEADERS, json=payload)
    res.raise_for_status()
    return res.json()["choices"][0]["message"]["content"]


if __name__ == "__main__":
    # 1. 텍스트 테스트
    print("=" * 50)
    print("[텍스트 테스트] google/gemma-3-27b-it:free")
    print("=" * 50)
    text_result = test_text(
        model="google/gemma-3-27b-it:free",
        prompt="한국어로 짧게 답해줘: 오늘 날씨가 맑으면 기분이 어때?",
    )
    print(text_result)

    # 2. 이미지 테스트
    print()
    print("=" * 50)
    print("[이미지 테스트] google/gemma-3-27b-it:free")
    print("=" * 50)
    image_result = test_image(
        model="google/gemma-3-27b-it:free",
        image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
        prompt="이 이미지에 무엇이 있는지 한국어로 설명해줘.",
    )
    print(image_result)
