import os
import random


def detect_video(file_path: str) -> dict:
    mode = os.getenv("DETECTION_MODE", "mock")

    if mode == "real":
        # Real mode: extract frames using OpenCV
        # import cv2
        # cap = cv2.VideoCapture(file_path)
        # frames = []
        # while cap.isOpened():
        #     ret, frame = cap.read()
        #     if not ret:
        #         break
        #     frames.append(frame)
        # cap.release()
        # TODO: load deepfake detection model and run inference per frame
        # model = load_model("path/to/model")
        # flagged = [i for i, f in enumerate(frames) if model.predict(f) > threshold]
        # confidence = len(flagged) / len(frames)
        raise NotImplementedError("Real detection mode requires a trained model.")

    # Mock mode: return simulated frame-level analysis
    rng = random.Random()
    confidence = round(rng.uniform(0.65, 0.95), 4)
    num_flagged = rng.randint(3, 5)
    total_frames = rng.randint(120, 900)
    flagged_frames = sorted(rng.sample(range(total_frames), num_flagged))

    explanation = (
        f"Temporal inconsistency detected across {num_flagged} frames "
        f"(indices: {flagged_frames}). Facial boundary blending artifacts and "
        "unnatural eye-blink cadence suggest GAN-based face-swap synthesis."
    )

    return {
        "confidence": confidence,
        "is_synthetic": True,
        "flagged_frames": flagged_frames,
        "explanation": explanation,
    }
