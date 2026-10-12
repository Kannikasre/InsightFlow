import os
import sys
import pandas as pd
from werkzeug.security import generate_password_hash

# Ensure root in sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.database import init_db, get_db
from backend.models import User, DatasetImport, Feedback, get_utc_now
from backend.pipeline import run_feedback_analysis

def seed():
    print("Initializing Database Schema...")
    init_db()
    db = get_db()

    # 1. Create Default Demo Users
    demo_user = db.query(User).filter_by(email="demo@insightflow.ai").first()
    if not demo_user:
        print("Creating Demo User...")
        demo_user = User(
            email="demo@insightflow.ai",
            password_hash=generate_password_hash("insightflow2026"),
            full_name="Alex Chen",
            role="VP of Product Experience",
            created_at=get_utc_now()
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created demo user: {demo_user.email}")
    else:
        print(f"Demo user exists: {demo_user.email}")

    # 2. Check if dataset is already seeded
    fb_count = db.query(Feedback).count()
    if fb_count >= 1000:
        print(f"Dataset already seeded ({fb_count} records found). Skipping re-seed.")
        return

    csv_path = os.path.join(BASE_DIR, "BuildBattle_2026_Customer_Feedback_Dataset.csv")
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}")
        return

    print(f"Reading {csv_path}...")
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    print(f"Found {total_rows} feedback rows. Seeding DatasetImport...")

    ds_import = DatasetImport(
        filename="BuildBattle_2026_Customer_Feedback_Dataset.csv",
        row_count=total_rows,
        valid_count=total_rows,
        rejected_count=0,
        status="processing",
        upload_date=get_utc_now(),
        user_id=demo_user.id
    )
    db.add(ds_import)
    db.commit()
    db.refresh(ds_import)

    print("Running Feedback Processing Pipeline & Adaption Integration...")
    result = run_feedback_analysis(csv_path, ds_import.id, user_id=demo_user.id)
    ds_import.status = "completed"
    db.commit()

    print(f"Seeding completed successfully!")
    print(f"Total analyzed: {result['total_analyzed']}")
    print(f"Positive: {result['positive_count']} | Neutral: {result['neutral_count']} | Negative: {result['negative_count']}")
    print(f"Adaption Mode: {result['adaption_mode']}")

if __name__ == "__main__":
    seed()
