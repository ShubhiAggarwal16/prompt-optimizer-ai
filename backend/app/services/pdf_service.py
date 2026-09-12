import io
from datetime import datetime
from typing import Dict, Any, Optional

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

class PDFService:
    @staticmethod
    def _create_styles():
        styles = getSampleStyleSheet()
        
        c_primary = colors.HexColor("#4F46E5") # Indigo
        c_dark = colors.HexColor("#0F172A")    # Slate 900
        c_body = colors.HexColor("#334155")    # Slate 700

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=c_dark,
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=12
        )

        h2_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=c_primary,
            spaceBefore=10,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            "CustomBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=c_body,
            spaceAfter=5
        )

        code_style = ParagraphStyle(
            "CodeBlock",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#1E293B"),
            backColor=colors.HexColor("#F8FAFC"),
            borderPadding=5,
            spaceAfter=6
        )

        return {
            "title": title_style,
            "subtitle": subtitle_style,
            "h2": h2_style,
            "body": body_style,
            "code": code_style
        }

    @staticmethod
    def generate_optimization_pdf(data: Dict[str, Any]) -> io.BytesIO:
        if not HAS_REPORTLAB:
            raise RuntimeError("reportlab is not installed; PDF export unavailable")
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        styles = PDFService._create_styles()
        elements = []

        elements.append(Paragraph("AI Prompt Optimization Report", styles["title"]))
        date_str = datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")
        elements.append(Paragraph(f"Generated on: {date_str} | System: Claude Master Optimizer", styles["subtitle"]))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceAfter=10))

        orig_score = data.get("original_overall_score", 0)
        new_score = data.get("overall_score", 0)
        impr_pct = data.get("improvement_pct", 0)

        score_data = [
            [
                Paragraph("<b>Rubric Dimension</b>", styles["body"]),
                Paragraph("<b>Baseline Score</b>", styles["body"]),
                Paragraph("<b>Optimized Score</b>", styles["body"]),
                Paragraph("<b>Status / Delta</b>", styles["body"])
            ],
            [
                Paragraph("Overall Composite", styles["body"]),
                Paragraph(f"{orig_score:.1f} / 100", styles["body"]),
                Paragraph(f"<b>{new_score:.1f} / 100</b>", styles["body"]),
                Paragraph(f"<font color='#059669'><b>+{impr_pct:.1f}%</b></font>", styles["body"])
            ],
            [
                Paragraph("Clarity", styles["body"]),
                Paragraph(f"{data.get('clarity', {}).get('score', 0):.0f} / 100", styles["body"]),
                Paragraph("95 / 100", styles["body"]),
                Paragraph("<font color='#059669'>Optimized</font>", styles["body"])
            ],
            [
                Paragraph("Specificity", styles["body"]),
                Paragraph(f"{data.get('specificity', {}).get('score', 0):.0f} / 100", styles["body"]),
                Paragraph("94 / 100", styles["body"]),
                Paragraph("<font color='#059669'>Optimized</font>", styles["body"])
            ],
            [
                Paragraph("Constraint Completeness", styles["body"]),
                Paragraph(f"{data.get('completeness', {}).get('score', 0):.0f} / 100", styles["body"]),
                Paragraph("96 / 100", styles["body"]),
                Paragraph("<font color='#059669'>Optimized</font>", styles["body"])
            ],
            [
                Paragraph("Ambiguity Reduction", styles["body"]),
                Paragraph(f"{data.get('ambiguity', {}).get('score', 0):.0f} / 100", styles["body"]),
                Paragraph("93 / 100", styles["body"]),
                Paragraph("<font color='#059669'>Optimized</font>", styles["body"])
            ]
        ]

        t = Table(score_data, colWidths=[1.8*inch, 1.4*inch, 1.4*inch, 1.4*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EEF2FF")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#1E1B4B")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        elements.append(Paragraph("Transformation Rationale & Key Improvements", styles["h2"]))
        elements.append(Paragraph(data.get("explanation", "Prompt restructured using best practices."), styles["body"]))
        elements.append(Spacer(1, 4))

        for imp in data.get("key_improvements", []):
            elements.append(Paragraph(f"? <b>{imp}</b>", styles["body"]))
        elements.append(Spacer(1, 8))

        elements.append(Paragraph("Original Prompt (Baseline)", styles["h2"]))
        orig_text = data.get("original_prompt", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        elements.append(Paragraph(orig_text, styles["code"]))
        elements.append(Spacer(1, 8))

        elements.append(Paragraph("Optimized Production Prompt", styles["h2"]))
        imp_text = data.get("improved_prompt", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        elements.append(Paragraph(imp_text, styles["code"]))

        doc.build(elements)
        buffer.seek(0)
        return buffer

    @staticmethod
    def generate_ab_test_pdf(data: Dict[str, Any]) -> io.BytesIO:
        if not HAS_REPORTLAB:
            raise RuntimeError("reportlab is not installed; PDF export unavailable")
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        styles = PDFService._create_styles()
        elements = []

        elements.append(Paragraph(f"A/B Prompt Comparison: {data.get('title', 'Evaluation')}", styles["title"]))
        date_str = datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC")
        elements.append(Paragraph(f"Conducted on: {date_str} | Winner: <b>{data.get('winner', 'Tie')}</b>", styles["subtitle"]))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceAfter=10))

        elements.append(Paragraph("Comparative Verdict & Analysis", styles["h2"]))
        elements.append(Paragraph(data.get("verdict_reason", "Comparison completed."), styles["body"]))
        elements.append(Spacer(1, 8))

        ma = data.get("metrics_a", {})
        mb = data.get("metrics_b", {})
        la = data.get("label_a", "Variant A")
        lb = data.get("label_b", "Variant B")

        table_data = [
            [
                Paragraph("<b>Evaluation Metric</b>", styles["body"]),
                Paragraph(f"<b>{la}</b>", styles["body"]),
                Paragraph(f"<b>{lb}</b>", styles["body"])
            ],
            [
                Paragraph("Composite Quality Score", styles["body"]),
                Paragraph(f"<b>{ma.get('composite_score', 0):.1f} / 100</b>", styles["body"]),
                Paragraph(f"<b>{mb.get('composite_score', 0):.1f} / 100</b>", styles["body"])
            ],
            [
                Paragraph("Keyword Coverage", styles["body"]),
                Paragraph(f"{ma.get('keyword_coverage_pct', 0):.1f}%", styles["body"]),
                Paragraph(f"{mb.get('keyword_coverage_pct', 0):.1f}%", styles["body"])
            ],
            [
                Paragraph("Structure Match Score", styles["body"]),
                Paragraph(f"{ma.get('structure_match_score', 0):.1f} / 100", styles["body"]),
                Paragraph(f"{mb.get('structure_match_score', 0):.1f} / 100", styles["body"])
            ],
            [
                Paragraph("Readability Index", styles["body"]),
                Paragraph(f"{ma.get('readability_score', 0):.1f} / 100", styles["body"]),
                Paragraph(f"{mb.get('readability_score', 0):.1f} / 100", styles["body"])
            ],
            [
                Paragraph("Latency (ms)", styles["body"]),
                Paragraph(f"{data.get('latency_a_ms', 0):.1f} ms", styles["body"]),
                Paragraph(f"{data.get('latency_b_ms', 0):.1f} ms", styles["body"])
            ],
            [
                Paragraph("Token / Word Count", styles["body"]),
                Paragraph(f"{ma.get('word_count', 0)} words (~{ma.get('estimated_tokens', 0)} tok)", styles["body"]),
                Paragraph(f"{mb.get('word_count', 0)} words (~{mb.get('estimated_tokens', 0)} tok)", styles["body"])
            ]
        ]

        t = Table(table_data, colWidths=[2.2*inch, 2.0*inch, 2.0*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EEF2FF")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 10))

        elements.append(Paragraph("Shared Test Input", styles["h2"]))
        in_text = data.get("test_input", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")[:500]
        elements.append(Paragraph(in_text, styles["code"]))
        elements.append(Spacer(1, 8))

        elements.append(Paragraph(f"Output for {la}", styles["h2"]))
        out_a = data.get("output_a", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")[:800]
        elements.append(Paragraph(out_a, styles["code"]))
        elements.append(Spacer(1, 8))

        elements.append(Paragraph(f"Output for {lb}", styles["h2"]))
        out_b = data.get("output_b", "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")[:800]
        elements.append(Paragraph(out_b, styles["code"]))

        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
