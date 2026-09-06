import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "backend")
    )
)

from app.db.database import SessionLocal, engine, Base
from app.models.schema import User
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()

users = [
    ("admin@hawkercredit.com", "9999900000", "admin123", "ADMIN"),
    ("lender@hawkercredit.com", "9999911111", "lender123", "LENDER"),
    ("vendor@hawkercredit.com", "9876543210", "vendor123", "VENDOR"),
]

for email, phone, password, role in users:
    existing = db.query(User).filter(User.email == email).first()

    if not existing:
        db.add(
            User(
                email=email,
                phone=phone,
                password_hash=get_password_hash(password),
                role=role
            )
        )
        print(f"Created {role}: {email}")
    else:
        print(f"Already exists: {email}")

db.commit()
db.close()

print("Demo users ready.")
