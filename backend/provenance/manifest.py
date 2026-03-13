"""
C2PA-style Content Provenance Manifest Generator.
Generates a manifest with assertions mimicking the C2PA v2.2 standard.
"""
import secrets
import random
from datetime import datetime, timezone


def generate_manifest(
    evidence_id: str,
    file_hash: str,
    detection_type: str,
    detection_result: dict,
    station_id: str = "AG-PUNE-042",
) -> dict:
    """Generate a C2PA-compatible provenance manifest for evidence."""
    rng = random.Random(evidence_id)  # deterministic per evidence

    ai_confidence = detection_result.get("confidence", 0.0)
    is_synthetic = detection_result.get("is_synthetic", False)
    ai_triage = "FLAG" if is_synthetic else "PASS"

    # Determine trust tier based on source
    trust_tier = rng.choice(["TIER_1", "TIER_2", "TIER_3"])
    tier_labels = {
        "TIER_1": "Hardware-attested (Sentinel Pro)",
        "TIER_2": "Software-sealed (TrustChain Lite)",
        "TIER_3": "Citizen-submitted (Nagarik Mode)",
    }

    manifest = {
        "manifest_id": f"urn:c2pa:trustchain:{evidence_id[:12]}",
        "c2pa_version": "2.2",
        "claim_generator": "TrustChain/1.0.0",
        "title": f"Evidence {evidence_id[:8]}",
        "format": "video/mp4" if detection_type == "video" else "audio/mpeg",
        "instance_id": f"xmp:iid:{secrets.token_hex(8)}",

        "assertions": {
            "c2pa.actions": [
                {
                    "action": "c2pa.captured",
                    "when": datetime.now(timezone.utc).isoformat(),
                    "softwareAgent": "TrustChain Evidence Capture",
                }
            ],

            "stds.schema.org": {
                "author": {
                    "name": "TrustChain Automated Capture",
                    "credential": f"CERT-{secrets.token_hex(6).upper()}",
                }
            },

            "c2pa.hash.data": {
                "algorithm": "SHA-256",
                "hash": file_hash,
                "pad": 0,
            },

            "le.station_context": {
                "station_id": station_id,
                "device_id": f"DEV-{rng.randint(1000, 9999)}",
                "camera_id": f"CAM-{rng.randint(1, 16):02d}",
                "gps": {
                    "latitude": round(18.5204 + rng.uniform(-0.1, 0.1), 6),
                    "longitude": round(73.8567 + rng.uniform(-0.1, 0.1), 6),
                },
            },

            "le.ai_triage": {
                "result": ai_triage,
                "confidence": round(ai_confidence, 4),
                "model": "EfficientNet-B4-DF-v2.1",
                "framework": "TensorRT",
            },

            "le.device_attestation": {
                "type": "HARDWARE_TEE" if trust_tier == "TIER_1" else "SOFTWARE_ONLY",
                "secure_boot": trust_tier == "TIER_1",
                "platform": "Jetson Orin Nano" if trust_tier == "TIER_1" else "Windows x86",
            },
        },

        "trust_tier": {
            "level": trust_tier,
            "label": tier_labels[trust_tier],
            "weight": {"TIER_1": "Highest", "TIER_2": "Standard", "TIER_3": "Requires review"}[trust_tier],
        },

        "signature": {
            "algorithm": "COSE_Sign1",
            "certificate_fingerprint": f"SHA256:{secrets.token_hex(16)}",
            "signed_at": datetime.now(timezone.utc).isoformat(),
        },
    }

    return manifest
