import os
import random


def detect_audio(file_path: str) -> dict:
    mode = os.getenv("DETECTION_MODE", "mock")

    if mode == "real":
        raise NotImplementedError("Real detection mode requires a trained model.")

    # Mock mode: return multi-modal analysis across 3 audio models
    rng = random.Random()

    # Model 1: Spectral — Wav2Vec2 features
    spectral_conf = round(rng.uniform(0.60, 0.97), 4)

    # Model 2: Bicoherence Analysis
    bicoherence_conf = round(rng.uniform(0.55, 0.96), 4)

    # Model 3: Voice Pattern — speaker embedding comparison
    voice_conf = round(rng.uniform(0.50, 0.98), 4)

    models = [
        {"name": "Spectral (Wav2Vec2)", "confidence": spectral_conf, "weight": 0.40},
        {"name": "Bicoherence Analysis", "confidence": bicoherence_conf, "weight": 0.35},
        {"name": "Voice Pattern (Speaker Embed)", "confidence": voice_conf, "weight": 0.25},
    ]

    weighted_conf = sum(m["confidence"] * m["weight"] for m in models)
    ensemble_confidence = round(weighted_conf, 4)

    flags = sum(1 for m in models if m["confidence"] > 0.5)
    agreement = f"{flags}/{len(models)}"

    features = {
        "mean_mag": round(rng.uniform(0.10, 0.50), 6),
        "var_mag": round(rng.uniform(0.01, 0.10), 6),
        "skew_mag": round(rng.uniform(-1.0, 1.0), 6),
        "kurt_mag": round(rng.uniform(2.0, 6.0), 6),
        "mean_phase": round(rng.uniform(-0.5, 0.5), 6),
        "var_phase": round(rng.uniform(0.01, 0.15), 6),
        "skew_phase": round(rng.uniform(-0.8, 0.8), 6),
        "kurt_phase": round(rng.uniform(2.5, 7.0), 6),
    }

    kurt_mag = features["kurt_mag"]
    explanation = (
        f"Multi-modal audio analysis across {len(models)} detection models. "
        f"Spectral analysis via Wav2Vec2 features detected synthetic patterns (confidence: {spectral_conf:.1%}). "
        f"Bicoherence kurtosis of {kurt_mag:.4f} exceeds human baseline of 2.8 ± 0.4. "
        f"Voice pattern analysis {'confirms' if voice_conf > 0.6 else 'does not confirm'} speaker inconsistency. "
        f"Agreement level: {agreement} models flag as synthetic."
    )

    xai_methods = [
        "Mel-spectrogram anomaly visualization",
        "Bicoherence phase coupling heatmap",
        "Speaker embedding distance comparison",
    ]
    model_breakdown = []
    for i, m in enumerate(models):
        model_breakdown.append({
            "name": m["name"],
            "confidence": m["confidence"],
            "weight": m["weight"],
            "is_flagged": m["confidence"] > 0.5,
            "xai_method": xai_methods[i],
        })

    return {
        "confidence": ensemble_confidence,
        "is_synthetic": True,
        "features": features,
        "explanation": explanation,
        "model_breakdown": model_breakdown,
        "agreement": agreement,
        "ensemble_method": "Weighted Vote",
    }
