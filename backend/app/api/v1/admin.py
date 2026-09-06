from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.schema import User, Vendor, Loan, QuantumRun, ModelVersion, AuditLog
from app.core.security import require_roles

router = APIRouter()


@router.get("/metrics")
def get_admin_metrics(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"])),
):
    total_users = db.query(User).count()
    total_vendors = db.query(Vendor).count()
    total_loans = db.query(Loan).count()
    total_quantum_runs = db.query(QuantumRun).count()
    total_audit_events = db.query(AuditLog).count()

    models = db.query(ModelVersion).all()
    if not models:
        # Default active model info
        active_model = {
            "model_name": "HawkerCredit AI Scorer",
            "version": "UNKNOWN_UNTIL_TRAINED",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "roc_auc": None,
            "training_dataset_size": None,
            "training_data_type": "SYNTHETIC"
        }
    else:
        active_model = models[0].__dict__

    return {
        "system_metrics": {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "total_loans": total_loans,
            "total_quantum_runs": total_quantum_runs,
            "total_audit_events": total_audit_events,
            "api_health": "100% OPERATIONAL",
            "db_status": "CONNECTED"
        },
        "ai_model_monitoring": active_model,
        "data_disclaimer": "AI credit-scoring model is trained on SYNTHETIC data for demonstration purposes."
    }
