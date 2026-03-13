"""
Image deepfake detection using Hugging Face Inference API.

Uses the prithivMLmods/Deep-Fake-Detector-v2-Model (ViT-based)
to classify images as Real or Deepfake. Falls back to mock mode
if no HF_API_TOKEN is set or the API call fails.

Free tier: ~30K requests/month — plenty for demo/prototype.
"""

import os
import random
import requests as http_requests


# Hugging Face models for deepfake detection (free inference API)
_HF_MODEL = "prithivMLmods/Deep-Fake-Detector-v2-Model"
_HF_API_URL = f"https://api-inference.huggingface.co/models/{_HF_MODEL}"


def _call_huggingface(file_path: str, api_token: str) -> dict | None:
    """Call the HF Inference API with the image file. Returns parsed result or None on failure."""
    headers = {"Authorization": f"Bearer {api_token}"}

    try:
        with open(file_path, "rb") as f:
            response = http_requests.post(
                _HF_API_URL,
                headers=headers,
                data=f.read(),
                timeout=30,
            )

        if response.status_code != 200:
            print(f"[HF API] Error {response.status_code}: {response.text[:200]}")
            return None

        results = response.json()
        if not isinstance(results, list) or len(results) == 0:
            print(f"[HF API] Unexpected response format: {results}")
            return None

        return results

    except Exception as e:
        print(f"[HF API] Request failed: {e}")
        return None


def _parse_hf_results(hf_results: list) -> dict:
    """
    Parse the HF classification results into our detection format.
    The model returns labels like 'Fake'/'Real' or 'Deepfake'/'Realism' with scores.
    """
    # Build a label -> score map (lowercase keys for matching)
    label_map = {}
    for item in hf_results:
        label = item.get("label", "").lower()
        score = item.get("score", 0.0)
        label_map[label] = score

    # Determine fake confidence — match various label formats
    fake_labels = ["fake", "deepfake", "ai-generated", "synthetic", "ai_generated"]
    real_labels = ["real", "realism", "authentic", "genuine", "original"]

    fake_score = 0.0
    real_score = 0.0

    for lbl in fake_labels:
        if lbl in label_map:
            fake_score = max(fake_score, label_map[lbl])
    for lbl in real_labels:
        if lbl in label_map:
            real_score = max(real_score, label_map[lbl])

    # If neither matched, use the raw scores
    if fake_score == 0 and real_score == 0 and len(hf_results) >= 2:
        # Assume first result is the top class
        top = hf_results[0]
        top_label = top.get("label", "").lower()
        if any(f in top_label for f in fake_labels):
            fake_score = top.get("score", 0.5)
            real_score = 1.0 - fake_score
        else:
            real_score = top.get("score", 0.5)
            fake_score = 1.0 - real_score

    is_synthetic = fake_score > real_score
    confidence = fake_score if is_synthetic else (1.0 - real_score) if real_score > 0 else 0.5

    # For the confidence in our system, we want:
    # - High value = more likely synthetic
    # - Low value = likely authentic
    if is_synthetic:
        confidence = fake_score
    else:
        confidence = fake_score  # Keep the fake score as base even when authentic

    explanation = (
        f"AI-powered image analysis using Vision Transformer (ViT) deep learning model. "
        f"The model classified this image with a deepfake probability of {fake_score:.1%} "
        f"and an authenticity probability of {real_score:.1%}. "
        f"{'The image exhibits characteristics consistent with AI generation or manipulation.' if is_synthetic else 'The image appears to be an authentic, unmanipulated photograph.'}"
    )

    return {
        "confidence": round(confidence, 4),
        "is_synthetic": is_synthetic,
        "explanation": explanation,
        "model_breakdown": [
            {
                "name": "ViT Deepfake Detector",
                "confidence": round(fake_score, 4),
                "weight": 1.0,
                "is_flagged": is_synthetic,
                "xai_method": "Vision Transformer classification with attention maps",
            }
        ],
        "agreement": "1/1" if is_synthetic else "0/1",
        "ensemble_method": "Single Model (HuggingFace Inference API)",
        "ai_model_used": _HF_MODEL,
        "raw_hf_response": [
            {"label": item.get("label", ""), "score": round(item.get("score", 0), 4)}
            for item in (hf_results or [])
        ],
    }


def _mock_image_detection() -> dict:
    """Fallback mock detection when no HF token is available."""
    rng = random.Random()
    conf = round(rng.uniform(0.55, 0.95), 4)
    is_synthetic = conf >= 0.5

    return {
        "confidence": conf,
        "is_synthetic": is_synthetic,
        "explanation": (
            "MOCK MODE: No HF_API_TOKEN configured. "
            "Set HF_API_TOKEN in your .env to enable real AI deepfake detection. "
            f"Mock confidence: {conf:.1%}."
        ),
        "model_breakdown": [
            {
                "name": "Mock Image Detector",
                "confidence": conf,
                "weight": 1.0,
                "is_flagged": is_synthetic,
                "xai_method": "Mock — no real analysis performed",
            }
        ],
        "agreement": "1/1" if is_synthetic else "0/1",
        "ensemble_method": "Mock Mode",
    }


def detect_image(file_path: str) -> dict:
    """
    Detect whether an image is a deepfake using Hugging Face Inference API.
    Falls back to mock mode if HF_API_TOKEN is not set.
    """
    mode = os.getenv("DETECTION_MODE", "mock")
    api_token = os.getenv("HF_API_TOKEN", "")

    # If DETECTION_MODE is explicitly "mock" or no token, use mock
    if mode == "mock" and not api_token:
        print("[Image Detector] No HF_API_TOKEN set, using mock mode")
        return _mock_image_detection()

    # Try real AI detection if token is available
    if api_token:
        print(f"[Image Detector] Using HuggingFace model: {_HF_MODEL}")
        hf_results = _call_huggingface(file_path, api_token)

        if hf_results is not None:
            return _parse_hf_results(hf_results)
        else:
            print("[Image Detector] HF API failed, falling back to mock mode")
            return _mock_image_detection()

    # No token available
    print("[Image Detector] No HF_API_TOKEN, using mock mode")
    return _mock_image_detection()
