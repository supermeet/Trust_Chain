import io
import os
import tempfile
from datetime import datetime, timezone

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    PageBreak,
    HRFlowable,
    KeepTogether,
)

_PDF_DIR = os.path.join(tempfile.gettempdir(), "trustchain_pdfs")
os.makedirs(_PDF_DIR, exist_ok=True)

# ── Color Palette ──
_NAVY = "#1d1d1f"
_BLUE = "#0066cc"
_GREY = "#6e6e73"
_LIGHT_BG = "#f5f5f7"
_BORDER = "#d2d2d7"
_RED = "#e5484d"
_GREEN = "#1b5e20"

# ── Page dimensions ──
_PAGE_W, _PAGE_H = A4
_LEFT_MARGIN = 2.2 * cm
_RIGHT_MARGIN = 2.2 * cm
_USABLE_W = _PAGE_W - _LEFT_MARGIN - _RIGHT_MARGIN  # ~16.6cm


def _make_qr_image(url: str) -> RLImage:
    qr = qrcode.QRCode(box_size=4, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return RLImage(buf, width=3 * cm, height=3 * cm)


def _divider(space_before=12, space_after=12):
    return HRFlowable(
        width="100%", thickness=0.5, color=colors.HexColor(_BORDER),
        spaceBefore=space_before, spaceAfter=space_after,
    )


def _section_table(data, col_widths, header_bg=_NAVY):
    """Create a styled table with header row. Wraps text in Paragraphs to prevent overflow."""
    cell_style = ParagraphStyle(
        "CellStyle", fontSize=7.5, fontName="Helvetica",
        textColor=colors.HexColor(_NAVY), leading=10,
    )
    header_cell_style = ParagraphStyle(
        "HeaderCellStyle", fontSize=7.5, fontName="Helvetica-Bold",
        textColor=colors.white, leading=10,
    )
    bold_cell_style = ParagraphStyle(
        "BoldCellStyle", fontSize=7.5, fontName="Helvetica-Bold",
        textColor=colors.HexColor(_NAVY), leading=10,
    )

    # Convert all data cells to Paragraphs for proper text wrapping
    wrapped_data = []
    for row_idx, row in enumerate(data):
        wrapped_row = []
        for col_idx, cell in enumerate(row):
            text = str(cell)
            if row_idx == 0:
                wrapped_row.append(Paragraph(text, header_cell_style))
            elif col_idx == 0:
                wrapped_row.append(Paragraph(text, bold_cell_style))
            else:
                wrapped_row.append(Paragraph(text, cell_style))
        wrapped_data.append(wrapped_row)

    t = Table(wrapped_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(header_bg)),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor(_BORDER)),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(_LIGHT_BG)]),
    ]))
    return t


def generate_pdf(evidence_data: dict) -> str:
    event_id: str = evidence_data.get("event_id", "UNKNOWN")
    file_hash: str = evidence_data.get("file_hash", "")
    blockchain_tx_id: str = evidence_data.get("blockchain_tx_id", "")
    timestamp: str = evidence_data.get("timestamp", datetime.now(timezone.utc).isoformat())
    detection: dict = evidence_data.get("detection", {})
    liability: dict = evidence_data.get("liability", {})

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    verify_url = f"{frontend_url}/verify/{event_id}"

    pdf_path = os.path.join(_PDF_DIR, f"{event_id}.pdf")
    doc = SimpleDocTemplate(
        pdf_path, pagesize=A4,
        leftMargin=_LEFT_MARGIN, rightMargin=_RIGHT_MARGIN,
        topMargin=1.8 * cm, bottomMargin=1.8 * cm,
    )

    # ── Custom Styles ──
    title_style = ParagraphStyle(
        "AGTitle", fontSize=24, fontName="Helvetica-Bold",
        textColor=colors.HexColor(_NAVY), spaceAfter=4, leading=28,
    )
    subtitle_style = ParagraphStyle(
        "AGSub", fontSize=9, fontName="Helvetica",
        textColor=colors.HexColor(_GREY), spaceAfter=6, leading=12,
    )
    heading_style = ParagraphStyle(
        "AGHeading", fontSize=12, fontName="Helvetica-Bold",
        textColor=colors.HexColor(_NAVY), spaceBefore=16, spaceAfter=8,
        leading=15,
    )
    body_style = ParagraphStyle(
        "AGBody", fontSize=9, fontName="Helvetica",
        textColor=colors.HexColor(_NAVY), leading=14, spaceAfter=4,
    )
    small_style = ParagraphStyle(
        "AGSmall", fontSize=7, fontName="Helvetica",
        textColor=colors.HexColor(_GREY), leading=10, spaceAfter=4,
    )

    story = []

    # ══════════════════════════════════════════
    # PAGE 1 — Header, Detection, Multi-Modal, Liability
    # ══════════════════════════════════════════

    # ── Header ──
    story.append(Paragraph("TrustChain", title_style))
    story.append(Paragraph("Evidence Integrity &amp; Authentication Certificate", subtitle_style))
    story.append(_divider(space_before=6, space_after=10))

    # ── Event Metadata Table ──
    hash_display = file_hash[:40] + "..." if len(file_hash) > 40 else file_hash
    tx_display = blockchain_tx_id[:40] + "..." if len(blockchain_tx_id) > 40 else blockchain_tx_id
    meta_data = [
        ["Field", "Value"],
        ["Event ID", event_id],
        ["File SHA-256", hash_display],
        ["Blockchain TX", tx_display],
        ["Timestamp (UTC)", timestamp],
    ]
    story.append(_section_table(meta_data, [4 * cm, _USABLE_W - 4 * cm]))
    story.append(Spacer(1, 0.5 * cm))

    # ── Detection Results ──
    is_synthetic: bool = detection.get("is_synthetic", False)
    confidence: float = detection.get("confidence", 0.0)
    explanation: str = detection.get("explanation", "No explanation available.")
    agreement: str = detection.get("agreement", "")
    ensemble_method: str = detection.get("ensemble_method", "")
    verdict_hex = _RED if is_synthetic else _GREEN
    verdict_text = "SYNTHETIC (AI-Generated)" if is_synthetic else "AUTHENTIC"

    detection_items = []
    detection_items.append(Paragraph("Detection Results", heading_style))
    detection_items.append(Paragraph(
        f"<b>Verdict:</b> <font color='{verdict_hex}'><b>{verdict_text}</b></font>",
        body_style))
    detection_items.append(Paragraph(
        f"<b>Ensemble Confidence:</b> {confidence * 100:.1f}%", body_style))
    if agreement:
        detection_items.append(Paragraph(
            f"<b>Model Agreement:</b> {agreement} models flag as synthetic", body_style))
    if ensemble_method:
        detection_items.append(Paragraph(
            f"<b>Ensemble Method:</b> {ensemble_method}", body_style))
    detection_items.append(Spacer(1, 0.2 * cm))

    # Truncate long explanations
    if len(explanation) > 400:
        explanation = explanation[:397] + "..."
    detection_items.append(Paragraph(f"<i>{explanation}</i>", small_style))
    story.extend(detection_items)
    story.append(Spacer(1, 0.4 * cm))

    # ── Multi-Modal AI Breakdown ──
    model_breakdown = detection.get("model_breakdown", [])
    if model_breakdown:
        story.append(Paragraph("Multi-Modal AI Analysis", heading_style))
        story.append(Paragraph(
            f"{len(model_breakdown)} independent models analyzed this evidence.",
            small_style))
        story.append(Spacer(1, 0.15 * cm))

        model_rows = [["Model", "Confidence", "Weight", "Status", "XAI Method"]]
        for m in model_breakdown:
            status = "FLAGGED" if m.get("is_flagged") else "PASS"
            xai = m.get("xai_method", "—")
            if len(xai) > 40:
                xai = xai[:37] + "..."
            model_rows.append([
                m.get("name", "Unknown"),
                f"{m.get('confidence', 0) * 100:.1f}%",
                f"{m.get('weight', 0) * 100:.0f}%",
                status,
                xai,
            ])

        model_table = _section_table(
            model_rows,
            [3.8 * cm, 2 * cm, 1.6 * cm, 1.6 * cm, _USABLE_W - 9 * cm],
        )
        story.append(model_table)
        story.append(Spacer(1, 0.4 * cm))

    story.append(_divider(space_before=8, space_after=8))

    # ── Liability Attribution ──
    story.append(Paragraph("Liability Attribution", heading_style))
    u = liability.get("user", {})
    p = liability.get("platform", {})
    a = liability.get("architect", {})

    liab_rows = [
        ["Party", "Liability %", "Raw Score"],
        ["User / Distributor", f"{u.get('percentage', 0)}%", str(round(u.get('raw_score', 0), 2))],
        ["Platform", f"{p.get('percentage', 0)}%", str(round(p.get('raw_score', 0), 2))],
        ["AI Architect", f"{a.get('percentage', 0)}%", str(round(a.get('raw_score', 0), 2))],
    ]
    story.append(_section_table(liab_rows, [5.5 * cm, 4 * cm, _USABLE_W - 9.5 * cm]))
    story.append(Spacer(1, 0.25 * cm))

    # Liability explanations
    for party_label, party_data in [("User", u), ("Platform", p), ("AI Architect", a)]:
        expl = party_data.get("explanation", "")
        if expl:
            if len(expl) > 200:
                expl = expl[:197] + "..."
            story.append(Paragraph(f"<b>{party_label}:</b> {expl}", small_style))

    # ══════════════════════════════════════════
    # PAGE 2 — C2PA, SMS Beacon, Legal, QR
    # ══════════════════════════════════════════
    story.append(PageBreak())

    story.append(Paragraph("TrustChain", title_style))
    story.append(Paragraph("Certificate — Page 2", subtitle_style))
    story.append(_divider(space_before=6, space_after=10))

    # ── C2PA Provenance Manifest ──
    story.append(Paragraph("Content Provenance (C2PA v2.2)", heading_style))
    story.append(Paragraph(
        "This section documents the C2PA-compatible provenance manifest generated "
        "for this evidence item, including trust tier classification.",
        small_style))
    story.append(Spacer(1, 0.15 * cm))

    c2pa_rows = [
        ["Attribute", "Value"],
        ["Manifest Standard", "C2PA v2.2"],
        ["Claim Generator", "TrustChain/1.0.0"],
        ["Hash Algorithm", "SHA-256"],
        ["Signature Algorithm", "COSE_Sign1"],
        ["Trust Tier", "Classified at evidence registration"],
    ]
    story.append(_section_table(c2pa_rows, [5 * cm, _USABLE_W - 5 * cm], header_bg=_BLUE))
    story.append(Spacer(1, 0.3 * cm))

    tier_rows = [
        ["Tier", "Source", "Attestation", "Weight"],
        ["TIER 1", "Hardware-attested (Sentinel Pro)", "Hardware TEE + Secure Boot", "Highest"],
        ["TIER 2", "Software-sealed (TrustChain Lite)", "Software-only", "Standard"],
        ["TIER 3", "Citizen-submitted (Nagarik Mode)", "Self-reported", "Requires review"],
    ]
    story.append(_section_table(
        tier_rows,
        [2 * cm, 5 * cm, 5 * cm, _USABLE_W - 12 * cm],
        header_bg=_BLUE,
    ))

    story.append(_divider(space_before=14, space_after=10))

    # ── SMS Beacon ──
    story.append(Paragraph("SMS Beacon Anchor", heading_style))
    story.append(Paragraph(
        "The SMS Beacon provides an independent, telecom-timestamped anchor for evidence "
        "integrity. A hash prefix is transmitted via GSM SMS to create a non-blockchain "
        "timestamp proof, enabling offline evidence sealing in areas without internet.",
        small_style))
    story.append(Spacer(1, 0.15 * cm))

    beacon_rows = [
        ["Attribute", "Value"],
        ["Protocol", "GSM SMS Beacon (hash prefix)"],
        ["Cross-Validation", "Hash prefix match + timestamp tolerance + station key"],
        ["Cost", "₹0.50 per beacon"],
        ["Offline Support", "Yes — works without internet"],
    ]
    story.append(_section_table(beacon_rows, [5 * cm, _USABLE_W - 5 * cm]))

    story.append(_divider(space_before=14, space_after=10))

    # ── Chain of Custody ──
    story.append(Paragraph("Chain of Custody", heading_style))
    story.append(Paragraph(
        "All custody transfers are digitally signed and timestamped. "
        "The full chain is viewable at the verification URL below. "
        "Valid custodian roles: Investigating Officer, Forensic Analyst, "
        "Station House Officer, Public Prosecutor, Court Registrar, Defense Counsel.",
        small_style))

    story.append(_divider(space_before=14, space_after=10))

    # ── Legal Framework ──
    story.append(Paragraph("Legal Framework", heading_style))

    legal_rows = [
        ["Statute", "Provision", "Application"],
        ["BSA §63", "Electronic evidence admissibility",
         "Blockchain TX + PDF certificate form the §63 certificate"],
        ["IT Act §66E", "Privacy violation via deepfake",
         "Liability scorer maps to this offence"],
        ["IT Act §79", "Safe Harbor for intermediaries",
         "Platform liability assessed under safe harbor erosion"],
        ["DPDPA §17(2)(a)", "Law enforcement exemption",
         "Evidence processed under LE exemption"],
        ["EU AI Act Art. 9", "Risk management for AI systems",
         "Architect safeguard scoring"],
    ]
    story.append(_section_table(
        legal_rows,
        [3 * cm, 4.5 * cm, _USABLE_W - 7.5 * cm],
    ))

    story.append(Spacer(1, 0.5 * cm))

    # ── QR Code ──
    story.append(Paragraph("Verification", heading_style))
    story.append(Paragraph(f"Scan to verify this record: {verify_url}", small_style))
    story.append(Spacer(1, 0.3 * cm))
    story.append(_make_qr_image(verify_url))

    story.append(Spacer(1, 0.4 * cm))
    story.append(_divider(space_before=8, space_after=6))
    story.append(Paragraph(
        "This document was auto-generated by TrustChain v2.0.0. "
        "It constitutes a forensic evidence certificate for use under BSA §63. "
        "Verify authenticity at the URL above.",
        small_style))

    doc.build(story)
    return pdf_path
