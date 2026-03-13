"""
SMS Beacon Simulator — simulates the GSM Timestamp Beacon for offline evidence sealing.
"""
import secrets
import random
from datetime import datetime, timezone, timedelta


def generate_beacon(evidence_id: str, file_hash: str) -> dict:
    """
    Simulate sending a hash beacon via SMS.
    Returns beacon reference, telecom timestamp, and cross-validation status.
    """
    rng = random.Random(evidence_id)

    # Generate beacon reference (like VR-2026-XXXX)
    year = datetime.now().year
    beacon_seq = rng.randint(1000, 9999)
    beacon_ref = f"AG-{year}-{beacon_seq}"

    # Hash prefix (first 16 chars sent via SMS)
    hash_prefix = file_hash[:16]

    # Simulated SMS content
    station_code = f"STN{rng.randint(1, 999):03d}"
    now = datetime.now(timezone.utc)
    sms_content = f"EVD|{station_code}|{now.strftime('%Y%m%d')}|{now.strftime('%H%M')}|{hash_prefix}"

    # Telecom timestamp (slightly offset from capture — simulates network delay)
    telecom_delay_ms = rng.randint(200, 3500)
    telecom_timestamp = (now + timedelta(milliseconds=telecom_delay_ms)).isoformat()

    # Cross-validation
    cross_validation = {
        "hash_prefix_match": True,  # SMS prefix matches full hash
        "timestamp_delta_ms": telecom_delay_ms,
        "timestamp_within_tolerance": telecom_delay_ms < 5000,
        "station_key_valid": True,
    }

    # Determine overall status
    all_checks_pass = all([
        cross_validation["hash_prefix_match"],
        cross_validation["timestamp_within_tolerance"],
        cross_validation["station_key_valid"],
    ])

    return {
        "beacon_ref": beacon_ref,
        "hash_prefix": hash_prefix,
        "full_hash": file_hash,
        "sms_content": sms_content,
        "station_code": station_code,
        "telecom_timestamp": telecom_timestamp,
        "capture_timestamp": now.isoformat(),
        "network_delay_ms": telecom_delay_ms,
        "cross_validation": cross_validation,
        "status": "ANCHORED" if all_checks_pass else "ALERT",
        "sms_cost_inr": 0.50,
    }
