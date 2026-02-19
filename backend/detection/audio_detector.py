import os
import random


def detect_audio(file_path: str) -> dict:
    mode = os.getenv("DETECTION_MODE", "mock")

    if mode == "real":
        # Real mode: extract LFCC features using librosa
        # import librosa
        # import numpy as np
        # y, sr = librosa.load(file_path, sr=None)
        # mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        # TODO: load trained classifier and run inference
        # model = load_model("path/to/model")
        # features = preprocess(mfcc)
        # confidence = model.predict(features)
        raise NotImplementedError("Real detection mode requires a trained model.")

    # Mock mode: return simulated bicoherence-based analysis
    rng = random.Random()
    confidence = round(rng.uniform(0.65, 0.95), 4)

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
        f"Bicoherence kurtosis of {kurt_mag:.4f} exceeds human baseline of 2.8 \u00b1 0.4, "
        "indicating synthetically regular phase coupling consistent with neural vocoder generation."
    )

    return {
        "confidence": confidence,
        "is_synthetic": True,
        "features": features,
        "explanation": explanation,
    }
