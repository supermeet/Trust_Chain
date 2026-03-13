import os
import random


def detect_video(file_path: str) -> dict:
    mode = os.getenv("DETECTION_MODE", "mock")

    if mode == "real":
        raise NotImplementedError("Real detection mode requires a trained model.")

    # Mock mode: return multi-modal analysis across 4 models
    rng = random.Random()
    total_frames = rng.randint(120, 900)

    # Model 1: Spatial — EfficientNet-B4
    spatial_conf = round(rng.uniform(0.60, 0.97), 4)
    spatial_flagged = sorted(rng.sample(range(total_frames), rng.randint(2, 5)))

    # Model 2: Temporal — TCN
    temporal_conf = round(rng.uniform(0.55, 0.96), 4)

    # Model 3: Frequency — FFT Spectral
    frequency_conf = round(rng.uniform(0.58, 0.98), 4)

    # Model 4: Camera Noise Pattern
    noise_conf = round(rng.uniform(0.50, 0.99), 4)

    # Ensemble decision (weighted vote)
    models = [
        {"name": "Spatial (EfficientNet-B4)", "confidence": spatial_conf, "weight": 0.30},
        {"name": "Temporal (TCN)", "confidence": temporal_conf, "weight": 0.25},
        {"name": "Frequency (FFT Spectral)", "confidence": frequency_conf, "weight": 0.25},
        {"name": "Camera Noise Pattern", "confidence": noise_conf, "weight": 0.20},
    ]

    weighted_conf = sum(m["confidence"] * m["weight"] for m in models)
    ensemble_confidence = round(weighted_conf, 4)

    # Agreement: how many models flag as synthetic (>0.5)
    flags = sum(1 for m in models if m["confidence"] > 0.5)
    agreement = f"{flags}/4"

    explanation = (
        f"Multi-modal ensemble analysis across {len(models)} detection models. "
        f"Spatial analysis detected blending artifacts in frames {spatial_flagged}. "
        f"Temporal analysis found unnatural blink patterns (confidence: {temporal_conf:.1%}). "
        f"Frequency domain detected GAN fingerprints (confidence: {frequency_conf:.1%}). "
        f"Camera noise pattern {'matches' if noise_conf < 0.6 else 'does not match'} expected sensor profile. "
        f"Agreement level: {agreement} models flag as synthetic."
    )

    model_breakdown = []
    xai_methods = [
        "Grad-CAM heatmap highlighting facial boundary regions",
        "Timeline anomaly graph showing temporal inconsistencies",
        "Spectral comparison chart with GAN frequency signatures",
        "Sensor noise pattern overlay comparison",
    ]
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
        "is_synthetic": ensemble_confidence >= 0.5,
        "flagged_frames": spatial_flagged,
        "explanation": explanation,
        "model_breakdown": model_breakdown,
        "agreement": agreement,
        "total_frames": total_frames,
        "ensemble_method": "Weighted Vote",
    }
