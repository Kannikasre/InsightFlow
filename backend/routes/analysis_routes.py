import os
import pandas as pd
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.config import Config
from backend.models import DatasetImport, AnalysisRun, get_utc_now
from backend.database import get_db
from backend.pipeline import run_feedback_analysis
from backend.auth import optional_auth

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api/import")

ALLOWED_EXTENSIONS = {"csv"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@analysis_bp.route("/preview", methods=["POST"])
@optional_auth
def preview_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Only CSV files are supported"}), 400

    try:
        # Read first 50 rows for preview & diagnostics
        df = pd.read_csv(file)
        file.seek(0)
        
        total_rows = len(df)
        columns = df.columns.tolist()
        
        # Check potential nulls & duplicates
        cols_lower = [c.lower().strip() for c in columns]
        text_col = columns[cols_lower.index("review")] if "review" in cols_lower else columns[0]
        
        null_count = int(df[text_col].isna().sum())
        duplicate_count = int(df.duplicated(subset=[text_col]).sum())
        valid_count = max(0, total_rows - null_count)

        sample_rows = df.head(6).fillna("").to_dict(orient="records")

        return jsonify({
            "filename": secure_filename(file.filename),
            "total_rows": total_rows,
            "valid_rows": valid_count,
            "null_rows": null_count,
            "duplicate_rows": duplicate_count,
            "columns": columns,
            "detected_text_column": text_col,
            "sample_rows": sample_rows
        })
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV file: {str(e)}"}), 400

@analysis_bp.route("/upload", methods=["POST"])
@optional_auth
def upload_and_analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only CSV files are supported"}), 400

    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    filename = secure_filename(file.filename)
    save_path = os.path.join(Config.UPLOAD_FOLDER, f"{int(get_utc_now().timestamp())}_{filename}")
    file.save(save_path)

    db = get_db()
    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    # Count rows
    try:
        df = pd.read_csv(save_path)
        row_count = len(df)
    except Exception:
        row_count = 0

    ds_import = DatasetImport(
        filename=filename,
        row_count=row_count,
        valid_count=row_count,
        rejected_count=0,
        status="processing",
        upload_date=get_utc_now(),
        user_id=user_id
    )
    db.add(ds_import)
    db.commit()
    db.refresh(ds_import)

    # Run analysis pipeline
    try:
        result = run_feedback_analysis(save_path, ds_import.id, user_id=user_id)
        ds_import.status = "completed"
        db.commit()
        return jsonify({
            "message": "Dataset successfully imported and analyzed",
            "import_id": ds_import.id,
            "run_id": result["run_id"],
            "total_analyzed": result["total_analyzed"],
            "positive_count": result["positive_count"],
            "neutral_count": result["neutral_count"],
            "negative_count": result["negative_count"],
            "execution_time_sec": result["execution_time_sec"],
            "adaption_mode": result["adaption_mode"]
        })
    except Exception as e:
        ds_import.status = "failed"
        db.commit()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@analysis_bp.route("/status/<int:run_id>", methods=["GET"])
@optional_auth
def get_analysis_status(run_id):
    db = get_db()
    run = db.query(AnalysisRun).filter_by(id=run_id).first()
    if not run:
        return jsonify({"error": "Analysis run not found"}), 404

    return jsonify({"run": run.to_dict()})

@analysis_bp.route("/seed-demo", methods=["POST"])
@optional_auth
def seed_demo_dataset():
    """Seeds the official Build Battle 2026 dataset (7,000 feedback records)."""
    dataset_path = os.path.join(os.path.dirname(Config.BASE_DIR), "BuildBattle_2026_Customer_Feedback_Dataset.csv")
    if not os.path.exists(dataset_path):
        return jsonify({"error": f"Official dataset not found at {dataset_path}"}), 404

    db = get_db()
    user_id = request.current_user.id if getattr(request, "current_user", None) else None

    df = pd.read_csv(dataset_path)
    total_rows = len(df)

    ds_import = DatasetImport(
        filename="BuildBattle_2026_Customer_Feedback_Dataset.csv",
        row_count=total_rows,
        valid_count=total_rows,
        rejected_count=0,
        status="processing",
        upload_date=get_utc_now(),
        user_id=user_id
    )
    db.add(ds_import)
    db.commit()
    db.refresh(ds_import)

    result = run_feedback_analysis(dataset_path, ds_import.id, user_id=user_id)
    ds_import.status = "completed"
    db.commit()

    return jsonify({
        "message": "Demo dataset loaded and processed successfully!",
        "import_id": ds_import.id,
        "run_id": result["run_id"],
        "total_analyzed": result["total_analyzed"],
        "positive_count": result["positive_count"],
        "neutral_count": result["neutral_count"],
        "negative_count": result["negative_count"],
        "execution_time_sec": result["execution_time_sec"],
        "adaption_mode": result["adaption_mode"]
    })
