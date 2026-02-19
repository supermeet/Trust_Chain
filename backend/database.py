import json
import os
import sqlite3
from datetime import datetime, timezone

_DB_PATH = os.getenv("DB_PATH", "/tmp/trustchain.db")


def init_db() -> None:
    with sqlite3.connect(_DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS evidence (
                id TEXT PRIMARY KEY,
                filename TEXT,
                file_hash TEXT,
                timestamp TEXT,
                detection_type TEXT,
                detection_confidence REAL,
                detection_result TEXT,
                is_synthetic BOOLEAN,
                blockchain_tx_id TEXT,
                liability_scores TEXT,
                pdf_path TEXT,
                status TEXT DEFAULT 'processed',
                created_at TEXT
            )
        """)
        conn.commit()


def save_evidence(data: dict) -> None:
    with sqlite3.connect(_DB_PATH) as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO evidence
                (id, filename, file_hash, timestamp, detection_type,
                 detection_confidence, detection_result, is_synthetic,
                 blockchain_tx_id, liability_scores, pdf_path, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("id"),
                data.get("filename"),
                data.get("file_hash"),
                data.get("timestamp"),
                data.get("detection_type"),
                data.get("detection_confidence"),
                json.dumps(data.get("detection_result", {})),
                data.get("is_synthetic"),
                data.get("blockchain_tx_id"),
                json.dumps(data.get("liability_scores", {})),
                data.get("pdf_path"),
                data.get("status", "processed"),
                data.get("created_at", datetime.now(timezone.utc).isoformat()),
            ),
        )
        conn.commit()


def get_evidence(evidence_id: str) -> dict | None:
    with sqlite3.connect(_DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT * FROM evidence WHERE id = ?", (evidence_id,)
        ).fetchone()
    if row is None:
        return None
    record = dict(row)
    for field in ("detection_result", "liability_scores"):
        if record.get(field):
            try:
                record[field] = json.loads(record[field])
            except (json.JSONDecodeError, TypeError):
                pass
    return record
