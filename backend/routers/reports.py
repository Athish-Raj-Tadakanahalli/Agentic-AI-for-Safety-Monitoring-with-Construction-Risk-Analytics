from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.services.report_generator import ReportGenerator

router = APIRouter(tags=["Automated Executive PDF & CSV Reporting"])
generator = ReportGenerator()

@router.get("/api/reports/{project_id}/pdf")
def download_pdf_report(
    project_id: int,
    report_type: str = Query("compliance", description="compliance, insurance, or executive"),
    db: Session = Depends(get_db)
):
    """
    GET /api/reports/{project_id}/pdf?report_type=
    Generates and returns styled PDF document download stream.
    """
    try:
        rtype = report_type.lower()
        if rtype == "compliance":
            pdf_bytes = generator.generate_compliance_pdf(db, project_id)
            filename = f"BuildSure_Compliance_Report_P{project_id}.pdf"
        elif rtype == "insurance":
            pdf_bytes = generator.generate_insurance_pdf(db, project_id)
            filename = f"BuildSure_Insurance_Certificate_P{project_id}.pdf"
        elif rtype == "executive":
            pdf_bytes = generator.generate_executive_pdf(db, project_id)
            filename = f"BuildSure_Executive_Digest_P{project_id}.pdf"
        else:
            raise HTTPException(status_code=400, detail="Invalid report_type. Choose compliance, insurance, or executive.")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/api/reports/{project_id}/export/csv")
def export_csv_data(
    project_id: int,
    data_type: str = Query("hazards", description="hazards, ppe, compliance, or insurance"),
    db: Session = Depends(get_db)
):
    """
    GET /api/reports/{project_id}/export/csv?data_type=
    Exports tabular project safety & compliance data as a downloadable CSV spreadsheet.
    """
    try:
        csv_text = generator.export_csv(db, project_id, data_type)
        filename = f"BuildSure_{data_type.lower()}_export_P{project_id}.csv"

        return Response(
            content=csv_text,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
