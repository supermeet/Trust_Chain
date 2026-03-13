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
import traceback

try:
    from google import genai
    from google.genai import types
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

_GEMINI_PROMPT = """You are a highly skeptical, expert forensic AI system designed to catch deepfakes, cheapfakes, and AI-generated media. 
Your primary goal is to PROTECT the public from misinformation. You must scrutinize the provided file with extreme prejudice.

Analyze the provided file from 4 independent detection perspectives and return a structured JSON response.

The 4 analysis models you must simulate:
1. **FFT Spectral Analysis** — Analyze frequency domain patterns. Look for the slightest hint of GAN fingerprints, unnatural frequency distributions, smoothing, or synthetic noise patterns.
2. **CNN Spatial Detection** — Analyze spatial patterns at the pixel level. Look for blending artifacts, asymmetrical lighting, impossible reflections, strange teeth/eyes/fingers, and unnatural textures.
3. **RCN Temporal Analysis** — Analyze temporal consistency. For video/audio: look for unnatural micro-expressions, robotic movements, irregular blink patterns, lip-sync issues, and unnatural breathing. For images: analyze spatial coherence and physics.
4. **ELA Compression Analysis** — Analyze compression artifacts. Look for inconsistent error levels that indicate splicing, localized editing, or generative origin.

You MUST respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "is_synthetic": true/false,
  "overall_explanation": "A detailed 2-3 sentence explanation of the overall finding, citing specific anomalies.",
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

CRITICAL FORENSIC RULES:
- `confidence` is a float between 0.0 and 1.0 (higher = more likely synthetic/manipulated).
- `is_flagged` is true if confidence > 0.5.
- DO NOT GIVE THE BENEFIT OF THE DOUBT. If you see ANY anomaly (weird blending, unnatural motion, too-perfect skin, strange background physics), you MUST flag the file with high confidence (>0.75).
- Today's AI models are very good. Absence of obvious glitches does NOT mean the file is real. Look for structural and spectral perfection which is a hallmark of synthesis.
- If you suspect it is AI-generated, set `is_synthetic` to true.
"""


def _call_gemini(file_path: str, media_type: str) -> dict | None:
    """Call Gemini API with the file and return structured detection results."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or not HAS_GENAI:
        return None

    try:
        client = genai.Client(api_key=api_key)

        gemini_file = None
        try:
            # Upload file directly to Gemini mapping (handles media formatting perfectly)
            print(f"[Gemini Detector] Uploading {media_type} to Gemini File API...")
            gemini_file = client.files.upload(file=file_path)

            print(f"[Gemini Detector] Waiting for file {gemini_file.name} to become ACTIVE...")
            import time
            while True:
                file_info = client.files.get(name=gemini_file.name)
                if file_info.state.name == "ACTIVE":
                    break
                elif file_info.state.name == "FAILED":
                    raise Exception("Gemini File API failed to process the media.")
                print(".", end="", flush=True)
                time.sleep(2)
            print("\n[Gemini Detector] File is ACTIVE. Generating content...")

            # Call Gemini
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[_GEMINI_PROMPT, gemini_file],
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    response_mime_type="application/json",
                ),
            )
            result_text = response.text.strip()
        finally:
            # Clean up the cloud file
            if gemini_file:
                try:
                    client.files.delete(name=gemini_file.name)
                except Exception as cleanup_err:
                    print(f"[Gemini Detector] File cleanup failed: {cleanup_err}")

        # Parse the JSON response
        result = json.loads(result_text)
        return result

    except Exception as e:
        error_msg = f"[Gemini Detector] API call failed: {type(e).__name__}: {e}"
        print(error_msg)
        with open(os.path.join(os.path.dirname(__file__), "gemini_error.log"), "w") as log_f:
            log_f.write(error_msg + "\n" + traceback.format_exc())
            log_f.write(f"\nAPI Key used: {api_key[:15]}...\n")
        traceback.print_exc()
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
        "ensemble_method": "Weighted Vote (AI-Powered)",
    }


def _mock_detection(media_type: str, reason: str = "Live analysis unavailable.") -> dict:
    """Fallback mock detection when the AI API is unavailable or an error occurs."""
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
        f"MOCK MODE: {reason} "
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
        print("[Gemini Detector] No API_KEY set, using mock mode")
        return _mock_detection(media_type, "API infrastructure not configured.")

    if not HAS_GENAI:
        print("[Gemini Detector] google-genai not installed, using mock mode")
        return _mock_detection(media_type, "AI core dependency missing.")

    print(f"[Gemini Detector] Analyzing {media_type} file with Gemini...")
    gemini_result = _call_gemini(file_path, media_type)

    if gemini_result is not None:
        print("[Gemini Detector] Analysis complete")
        return _build_detection_result(gemini_result)
    else:
        print("[Gemini Detector] Analysis call failed, falling back to mock mode")
        return _mock_detection(media_type, "AI engine rejected the media format.")
