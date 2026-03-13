"""
Chain of Custody Manager — tracks every custodian transfer for evidence.
"""
import json
import os
import secrets
import sqlite3
import tempfile
from datetime import datetime, timezone

_DB_PATH = os.getenv("DB_PATH", os.path.join(tempfile.gettempdir(), "trustchain.db"))

VALID_ROLES = [
    "Investigating Officer",
    "Forensic Analyst",
    "Station House Officer",
    "Public Prosecutor",
    "Court Registrar",
    "Defense Counsel",
]


def _conn():
    return sqlite3.connect(_DB_PATH)


def init_custody_table() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS custody_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                evidence_id TEXT NOT NULL,
                custodian_name TEXT NOT NULL,
                custodian_role TEXT NOT NULL,
                custodian_badge TEXT,
                action TEXT NOT NULL DEFAULT 'transfer',
                signature TEXT NOT NULL,
                notes TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (evidence_id) REFERENCES evidence(id)
            )
        """)
        conn.commit()


def add_custody_event(
    evidence_id: str,
    custodian_name: str,
    custodian_role: str,
    custodian_badge: str = "",
    action: str = "transfer",
    notes: str = "",
) -> dict:
    """Add a custody transfer event. Returns the event record."""
    timestamp = datetime.now(timezone.utc).isoformat()
    signature = "0x" + secrets.token_hex(32)  # mock digital signature

    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO custody_log
                (evidence_id, custodian_name, custodian_role, custodian_badge,
                 action, signature, notes, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (evidence_id, custodian_name, custodian_role, custodian_badge,
             action, signature, notes, timestamp),
        )
        conn.commit()

    return {
        "evidence_id": evidence_id,
        "custodian_name": custodian_name,
        "custodian_role": custodian_role,
        "custodian_badge": custodian_badge,
        "action": action,
        "signature": signature,
        "notes": notes,
        "timestamp": timestamp,
    }


def get_custody_chain(evidence_id: str) -> list[dict]:
    """Get the full chain of custody for an evidence item."""
    with _conn() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM custody_log WHERE evidence_id = ? ORDER BY timestamp ASC",
            (evidence_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def auto_register_initial_custody(evidence_id: str) -> dict:
    """Auto-register the first custody entry when evidence is uploaded."""
    return add_custody_event(
        evidence_id=evidence_id,
        custodian_name="System Auto-Capture",
        custodian_role="Investigating Officer",
        custodian_badge="AUTO",
        action="registered",
        notes="Evidence captured and registered on TrustChain platform.",
    )
