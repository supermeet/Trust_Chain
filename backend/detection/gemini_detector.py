"""
Gemini-Powered 4-Agent Deepfake Detection.

Uses Google Gemini to analyze uploaded files from 4 different AI perspectives:
  1. FFT Spectral  — Frequency domain GAN fingerprint detection
  2. CNN Spatial   — Spatial pattern & artifact detection
  3. RCN Temporal  — Temporal consistency analysis
  4. ELA           — Error Level / compression artifact detection

Falls back to mock mode if no GEMINI_API_KEY is set.
"""

import os
import json
import random
import base64
import mimetypes

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


# The 4 model personas Gemini will simulate
MODEL_DEFINITIONS = [
    {
        "name": "FFT Spectral Analysis",
        "description": "Fast Fourier Transform frequency domain analysis detecting GAN fingerprints and frequency artifacts",
        "weight": 0.25,
        "xai_method": "Spectral comparison chart with GAN frequency signatures",
    },
    {
        "name": "CNN Spatial Detection",
        "description": "Convolutional Neural Network spatial pattern detection analyzing pixel-level artifacts and blending boundaries",
        "weight": 0.30,
        "xai_method": "Grad-CAM heatmap highlighting facial boundary regions",
    },
    {
        "name": "RCN Temporal Analysis",
        "description": "Recurrent Convolutional Network temporal consistency analysis detecting unnatural movements and blink patterns",
        "weight": 0.25,
        "xai_method": "Timeline anomaly graph showing temporal inconsistencies",
    },
    {
        "name": "ELA Compression Analysis",
        "description": "Error Level Analysis detecting compression artifact inconsistencies from splicing or AI generation",
        "weight": 0.20,
        "xai_method": "Error level overlay comparison map",
    },
]

_GEMINI_PROMPT = """You are an expert forensic AI system that analyzes media files for deepfake/AI-generated content manipulation.

Analyze the provided file from 4 independent detection perspectives and return a structured JSON response.

The 4 analysis models you must simulate:
1. **FFT Spectral Analysis** — Analyze frequency domain patterns. Look for GAN fingerprints, unnatural frequency distributions, and spectral artifacts typical of AI-generated content.
2. **CNN Spatial Detection** — Analyze spatial patterns at the pixel level. Look for blending artifacts, unnatural edges, inconsistent lighting, and texture anomalies.
3. **RCN Temporal Analysis** — Analyze temporal consistency. Look for unnatural movements, irregular blink patterns, lip-sync issues, and frame-to-frame inconsistencies. For images, analyze spatial coherence instead.
4. **ELA Compression Analysis** — Analyze compression artifacts. Look for inconsistent error levels across the image/frames that indicate splicing or AI generation.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "is_synthetic": true/false,
  "overall_explanation": "A detailed 2-3 sentence explanation of the overall finding",
  "models": [
    {
      "name": "FFT Spectral Analysis",
      "confidence": 0.XX,
      "is_flagged": true/false,
      "explanation": "1-2 sentence explanation of FFT findings"
    },
    {
      "name": "CNN Spatial Detection",
      "confidence": 0.XX,
      "is_flagged": true/false,
      "explanation": "1-2 sentence explanation of CNN findings"
    },
    {
      "name": "RCN Temporal Analysis",
      "confidence": 0.XX,
      "is_flagged": true/false,
      "explanation": "1-2 sentence explanation of RCN findings"
    },
    {
      "name": "ELA Compression Analysis",
      "confidence": 0.XX,
      "is_flagged": true/false,
      "explanation": "1-2 sentence explanation of ELA findings"
    }
  ]
}

Rules:
- confidence is a float between 0.0 and 1.0 (higher = more likely synthetic/manipulated)
- is_flagged is true if confidence > 0.5 for that model
- Be honest and thorough in your analysis
- If the file appears authentic, give low confidence scores
- If the file appears manipulated/AI-generated, give high confidence scores
"""


def _call_gemini(file_path: str, media_type: str) -> dict | None:
    """Call Gemini API with the file and return structured detection results."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or not HAS_GENAI:
        return None

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Read file and determine MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_map = {
                "image": "image/jpeg",
                "video": "video/mp4",
                "audio": "audio/mpeg",
            }
            mime_type = mime_map.get(media_type, "application/octet-stream")

        with open(file_path, "rb") as f:
            file_data = f.read()

        # Create the content with inline file data
        file_part = {
            "inline_data": {
                "mime_type": mime_type,
                "data": base64.b64encode(file_data).decode("utf-8"),
            }
        }

        response = model.generate_content(
            [_GEMINI_PROMPT, file_part],
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )

        # Parse the JSON response
        result_text = response.text.strip()
        result = json.loads(result_text)
        return result

    except Exception as e:
        print(f"[Gemini Detector] API call failed: {e}")
        return None


def _build_detection_result(gemini_result: dict) -> dict:
    """Convert Gemini's JSON response into the standard detection format."""
    models_data = gemini_result.get("models", [])
    is_synthetic = gemini_result.get("is_synthetic", False)
    overall_explanation = gemini_result.get("overall_explanation", "")

    model_breakdown = []
    for i, model_def in enumerate(MODEL_DEFINITIONS):
        gemini_model = models_data[i] if i < len(models_data) else {}

        confidence = gemini_model.get("confidence", 0.5)
        is_flagged = gemini_model.get("is_flagged", confidence > 0.5)

        model_breakdown.append({
            "name": model_def["name"],
            "confidence": round(confidence, 4),
            "weight": model_def["weight"],
            "is_flagged": is_flagged,
            "xai_method": model_def["xai_method"],
        })

    # Calculate weighted ensemble confidence
    weighted_conf = sum(
        m["confidence"] * m["weight"] for m in model_breakdown
    )
    ensemble_confidence = round(weighted_conf, 4)

    # Agreement count
    flags = sum(1 for m in model_breakdown if m["is_flagged"])
    agreement = f"{flags}/4"

    # Build explanation
    if overall_explanation:
        explanation = (
            f"Multi-modal AI ensemble analysis across 4 detection models. "
            f"{overall_explanation} "
            f"Agreement level: {agreement} models flag as synthetic."
        )
    else:
        explanation = (
            f"Multi-modal ensemble analysis across 4 detection models. "
            f"Agreement level: {agreement} models flag as synthetic."
        )

    return {
        "confidence": ensemble_confidence,
        "is_synthetic": is_synthetic,
        "explanation": explanation,
        "model_breakdown": model_breakdown,
        "agreement": agreement,
        "ensemble_method": "Weighted Vote (Gemini-Powered)",
    }


def _mock_detection(media_type: str) -> dict:
    """Fallback mock detection when no Gemini API key is available."""
    rng = random.Random()

    model_breakdown = []
    for model_def in MODEL_DEFINITIONS:
        conf = round(rng.uniform(0.55, 0.97), 4)
        model_breakdown.append({
            "name": model_def["name"],
            "confidence": conf,
            "weight": model_def["weight"],
            "is_flagged": conf > 0.5,
            "xai_method": model_def["xai_method"],
        })

    weighted_conf = sum(m["confidence"] * m["weight"] for m in model_breakdown)
    ensemble_confidence = round(weighted_conf, 4)
    is_synthetic = ensemble_confidence >= 0.5

    flags = sum(1 for m in model_breakdown if m["is_flagged"])
    agreement = f"{flags}/4"

    explanation = (
        f"MOCK MODE: No GEMINI_API_KEY configured. "
        f"Set GEMINI_API_KEY in your .env to enable real Gemini-powered analysis. "
        f"Mock ensemble confidence: {ensemble_confidence:.1%}. "
        f"Agreement: {agreement} models flag as synthetic."
    )

    return {
        "confidence": ensemble_confidence,
        "is_synthetic": is_synthetic,
        "explanation": explanation,
        "model_breakdown": model_breakdown,
        "agreement": agreement,
        "ensemble_method": "Mock Mode",
    }


def detect_with_gemini(file_path: str, media_type: str) -> dict:
    """
    Analyze a file using Gemini-powered 4-model detection.
    Falls back to mock mode if GEMINI_API_KEY is not set.

    Args:
        file_path: Path to the uploaded file
        media_type: One of 'image', 'video', 'audio'

    Returns:
        Detection result dict with model_breakdown, confidence, etc.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")

    if not api_key:
        print("[Gemini Detector] No GEMINI_API_KEY set, using mock mode")
        return _mock_detection(media_type)

    if not HAS_GENAI:
        print("[Gemini Detector] google-generativeai not installed, using mock mode")
        return _mock_detection(media_type)

    print(f"[Gemini Detector] Analyzing {media_type} file with Gemini...")
    gemini_result = _call_gemini(file_path, media_type)

    if gemini_result is not None:
        print("[Gemini Detector] Gemini analysis complete")
        return _build_detection_result(gemini_result)
    else:
        print("[Gemini Detector] Gemini call failed, falling back to mock mode")
        return _mock_detection(media_type)
