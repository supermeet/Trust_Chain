import json
import os

_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "model_registry.json")

with open(_REGISTRY_PATH) as _f:
    _MODEL_REGISTRY: dict = json.load(_f)


def _score_user(ctx: dict) -> tuple[float, dict]:
    disclosure_stripped: bool = ctx.get("disclosure_stripped", False)
    content_distributed: bool = ctx.get("content_distributed", False)
    victim_impersonated: bool = ctx.get("victim_impersonated", False)
    repeat_offender: bool = ctx.get("repeat_offender", False)

    # Intent (max 0.35)
    if disclosure_stripped:
        intent_pts = 0.35
    elif content_distributed:
        intent_pts = 0.20
    else:
        intent_pts = 0.05

    # Action (max 0.30)
    if content_distributed and disclosure_stripped:
        action_pts = 0.30
    elif content_distributed:
        action_pts = 0.15
    else:
        action_pts = 0.05

    # Consent (max 0.20)
    consent_pts = 0.20 if victim_impersonated else 0.00

    # Prior (max 0.15)
    prior_pts = 0.15 if repeat_offender else 0.02

    raw = intent_pts + action_pts + consent_pts + prior_pts
    factors = {
        "intent": {"points": intent_pts, "max": 0.35, "legal_basis": "IPC §66E / IT Act §72A"},
        "action": {"points": action_pts, "max": 0.30, "legal_basis": "IPC §500 / Defamation Act"},
        "consent": {"points": consent_pts, "max": 0.20, "legal_basis": "IT Act §43A"},
        "prior_offences": {"points": prior_pts, "max": 0.15, "legal_basis": "CrPC §110 / Repeat Offender doctrine"},
    }
    return raw, factors


def _score_platform(ctx: dict) -> tuple[float, dict]:
    platform_name: str = ctx.get("platform_name", "Other")
    takedown_requested: bool = ctx.get("takedown_requested", False)
    response_hours: float = ctx.get("response_hours", 999.0)
    estimated_reach: int = ctx.get("estimated_reach", 0)

    _detection_map = {
        "YouTube": 0.05,
        "Instagram": 0.10,
        "WhatsApp": 0.20,
        "Telegram": 0.25,
        "X": 0.15,
    }
    detection_pts = _detection_map.get(platform_name, 0.25)

    # Response time (max 0.35)
    if not takedown_requested:
        response_pts = 0.00
    elif response_hours <= 12:
        response_pts = 0.00
    elif response_hours <= 24:
        response_pts = 0.10
    elif response_hours <= 36:
        response_pts = 0.20
    else:
        response_pts = 0.35

    # Amplification (max 0.25)
    if estimated_reach < 1000:
        amp_pts = 0.05
    elif estimated_reach < 100000:
        amp_pts = 0.15
    else:
        amp_pts = 0.25

    # Safe Harbor (max 0.15)
    _harbor_map = {
        "YouTube": 0.00,
        "Instagram": 0.00,
        "WhatsApp": 0.07,
        "Telegram": 0.10,
        "X": 0.05,
    }
    harbor_pts = _harbor_map.get(platform_name, 0.15)

    raw = detection_pts + response_pts + amp_pts + harbor_pts
    factors = {
        "detection_capability": {"points": detection_pts, "max": 0.25, "legal_basis": "IT Rules 2021 Rule 4(4)"},
        "response_time": {"points": response_pts, "max": 0.35, "legal_basis": "IT Rules 2021 Rule 4(1)(d) — 36h takedown"},
        "amplification": {"points": amp_pts, "max": 0.25, "legal_basis": "EU DSA Art. 34 — Systemic risk"},
        "safe_harbor_erosion": {"points": harbor_pts, "max": 0.15, "legal_basis": "IT Act §79 Safe Harbor conditions"},
    }
    return raw, factors


def _score_architect(ctx: dict) -> tuple[float, dict]:
    model_name: str = ctx.get("model_name", "Unknown Model")
    entry = _MODEL_REGISTRY.get(model_name, _MODEL_REGISTRY["Unknown Model"])

    has_watermark: bool = entry.get("has_watermark", False)
    has_content_filter: bool = entry.get("has_content_filter", False)
    access_type: str = entry.get("access_type", "open_source")
    known_incidents: int = entry.get("known_incidents", 0)

    # Safeguards (max 0.40)
    if has_watermark and has_content_filter:
        safeguard_pts = 0.00
    elif has_watermark:
        safeguard_pts = 0.15
    else:
        safeguard_pts = 0.40

    # Access (max 0.30)
    _access_map = {
        "api_gated_with_identity": 0.00,
        "api_gated_basic": 0.10,
        "open_source": 0.30,
    }
    access_pts = _access_map.get(access_type, 0.30)

    # History (max 0.30)
    if known_incidents == 0:
        history_pts = 0.00
    elif known_incidents <= 10:
        history_pts = 0.10
    elif known_incidents <= 50:
        history_pts = 0.20
    else:
        history_pts = 0.30

    raw = safeguard_pts + access_pts + history_pts
    factors = {
        "safeguards": {"points": safeguard_pts, "max": 0.40, "legal_basis": "EU AI Act Art. 9 — Risk management"},
        "access_control": {"points": access_pts, "max": 0.30, "legal_basis": "EU AI Act Art. 13 — Transparency"},
        "incident_history": {"points": history_pts, "max": 0.30, "legal_basis": "Product Liability — negligent design"},
    }
    return raw, factors


def compute_liability(ctx: dict) -> dict:
    raw_user, user_factors = _score_user(ctx)
    raw_platform, platform_factors = _score_platform(ctx)
    raw_architect, arch_factors = _score_architect(ctx)

    total = raw_user + raw_platform + raw_architect
    if total == 0:
        u_pct, p_pct, a_pct = 33, 33, 34
    else:
        u_pct = int(round(raw_user / total * 100))
        p_pct = int(round(raw_platform / total * 100))
        a_pct = 100 - u_pct - p_pct  # ensure sums to 100

    def _explain(name: str, pct: int, raw: float, factors: dict) -> str:
        top = max(factors.items(), key=lambda kv: kv[1]["points"])
        return (
            f"{name} bears {pct}% liability (raw score {raw:.3f}). "
            f"Primary driver: {top[0]} ({top[1]['points']:.2f}/{top[1]['max']:.2f} pts). "
            f"Legal basis: {top[1]['legal_basis']}."
        )

    return {
        "user": {
            "percentage": u_pct,
            "raw_score": round(raw_user, 4),
            "factors": user_factors,
            "explanation": _explain("User", u_pct, raw_user, user_factors),
        },
        "platform": {
            "percentage": p_pct,
            "raw_score": round(raw_platform, 4),
            "factors": platform_factors,
            "explanation": _explain("Platform", p_pct, raw_platform, platform_factors),
        },
        "architect": {
            "percentage": a_pct,
            "raw_score": round(raw_architect, 4),
            "factors": arch_factors,
            "explanation": _explain("AI Architect", a_pct, raw_architect, arch_factors),
        },
    }
