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

            "le.ai_triage": {
                "result": ai_triage,
                "confidence": round(ai_confidence, 4),
                "model": "EfficientNet-B4-DF-v2.1",
                "framework": "TensorRT",
            },
        },



        "signature": {
            "algorithm": "COSE_Sign1",
            "certificate_fingerprint": f"SHA256:{secrets.token_hex(16)}",
            "signed_at": datetime.now(timezone.utc).isoformat(),
        },
    }

    return manifest
