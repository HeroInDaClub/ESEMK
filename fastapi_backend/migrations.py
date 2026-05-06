from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


MEDICAL_RECORD_COLUMNS = {
    "blood_type": "VARCHAR(16)",
    "blood_pressure": "VARCHAR(32)",
    "height_cm": "INTEGER",
    "weight_kg": "FLOAT",
    "immunizations": "TEXT",
    "lifestyle": "TEXT",
    "restrictions": "TEXT",
    "risk_factors": "TEXT",
    "emergency_contact": "VARCHAR(160)",
}


def ensure_runtime_schema(engine: Engine) -> None:
    inspector = inspect(engine)
    if "app_medical_records" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("app_medical_records")}
    missing_columns = {
        name: column_type
        for name, column_type in MEDICAL_RECORD_COLUMNS.items()
        if name not in existing_columns
    }
    if not missing_columns:
        return

    with engine.begin() as connection:
        for name, column_type in missing_columns.items():
            connection.execute(text(f"ALTER TABLE app_medical_records ADD COLUMN {name} {column_type}"))
