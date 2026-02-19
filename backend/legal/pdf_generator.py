import io
import os
from datetime import datetime, timezone

import qrcode
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
)

_PDF_DIR = "/tmp/trustchain_pdfs"
os.makedirs(_PDF_DIR, exist_ok=True)


def _make_qr_image(url: str) -> RLImage:
    qr = qrcode.QRCode(box_size=4, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return RLImage(buf, width=3 * cm, height=3 * cm)


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
    doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                            leftMargin=2 * cm, rightMargin=2 * cm,
                            topMargin=2 * cm, bottomMargin=2 * cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TrustTitle", fontSize=20, fontName="Helvetica-Bold",
                                  textColor=colors.HexColor("#1a237e"), spaceAfter=4)
    sub_style = ParagraphStyle("TrustSub", fontSize=10, fontName="Helvetica",
                                textColor=colors.grey, spaceAfter=12)
    heading_style = ParagraphStyle("TrustHeading", fontSize=13, fontName="Helvetica-Bold",
                                    textColor=colors.HexColor("#1a237e"), spaceBefore=14, spaceAfter=6)
    body_style = styles["BodyText"]
    small_style = ParagraphStyle("Small", fontSize=8, fontName="Helvetica",
                                  textColor=colors.grey)

    story = []

    # Header
    story.append(Paragraph("🔗 TrustChain", title_style))
    story.append(Paragraph("AI Deepfake Evidence Certificate", sub_style))
    story.append(Spacer(1, 0.3 * cm))

    # Event metadata table
    meta_data = [
        ["Event ID", event_id],
        ["File SHA-256", Paragraph(f"<font size='7'>{file_hash}</font>", body_style)],
        ["Blockchain TX", Paragraph(f"<font size='7'>{blockchain_tx_id}</font>", body_style)],
        ["Timestamp (UTC)", timestamp],
    ]
    meta_table = Table(meta_data, colWidths=[4 * cm, 13 * cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8eaf6")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c5cae9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.4 * cm))

    # Detection results
    story.append(Paragraph("Detection Results", heading_style))
    _COLOR_SYNTHETIC = "#b71c1c"
    _COLOR_AUTHENTIC = "#1b5e20"

    is_synthetic: bool = detection.get("is_synthetic", False)
    confidence: float = detection.get("confidence", 0.0)
    explanation: str = detection.get("explanation", "No explanation available.")
    verdict_hex = _COLOR_SYNTHETIC if is_synthetic else _COLOR_AUTHENTIC
    verdict_text = "SYNTHETIC (AI-Generated)" if is_synthetic else "AUTHENTIC"
    story.append(Paragraph(
        f"<b>Verdict:</b> <font color='{verdict_hex}'>{verdict_text}</font>",
        body_style))
    story.append(Paragraph(f"<b>Confidence:</b> {confidence * 100:.1f}%", body_style))
    story.append(Paragraph(f"<b>Analysis:</b> {explanation}", body_style))
    story.append(Spacer(1, 0.4 * cm))

    # Liability breakdown
    story.append(Paragraph("Liability Attribution", heading_style))
    u = liability.get("user", {})
    p = liability.get("platform", {})
    a = liability.get("architect", {})

    liab_summary = [
        ["Party", "Liability %", "Raw Score"],
        ["User / Distributor", f"{u.get('percentage', 0)}%", str(u.get("raw_score", 0))],
        ["Platform", f"{p.get('percentage', 0)}%", str(p.get("raw_score", 0))],
        ["AI Architect", f"{a.get('percentage', 0)}%", str(a.get("raw_score", 0))],
    ]
    liab_table = Table(liab_summary, colWidths=[7 * cm, 4 * cm, 6 * cm])
    liab_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c5cae9")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
    ]))
    story.append(liab_table)
    story.append(Spacer(1, 0.2 * cm))

    for party_label, party_data in [("User", u), ("Platform", p), ("AI Architect", a)]:
        expl = party_data.get("explanation", "")
        if expl:
            story.append(Paragraph(f"<i>{party_label}:</i> {expl}", small_style))

    story.append(Spacer(1, 0.4 * cm))

    # Legal basis
    story.append(Paragraph("Legal Framework", heading_style))
    story.append(Paragraph(
        "This certificate has evidentiary value under <b>Section 65B of the Indian Evidence Act, 1872</b> "
        "(electronic record admissibility) and <b>BSA §63</b> (Business and Service Act provisions for "
        "digital evidence). The blockchain transaction ID constitutes an immutable tamper-evident record. "
        "Liability attribution follows IT Act 2000 §66E, §72A, §79 and EU AI Act Articles 9, 13.",
        body_style))
    story.append(Spacer(1, 0.4 * cm))

    # QR code
    story.append(Paragraph("Verification QR Code", heading_style))
    story.append(Paragraph(f"Scan to verify this record online: {verify_url}", small_style))
    story.append(Spacer(1, 0.2 * cm))
    story.append(_make_qr_image(verify_url))

    doc.build(story)
    return pdf_path
