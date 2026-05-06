from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from ..serializers import medical_record_to_read, user_to_read


router = APIRouter(prefix="/users", tags=["users"])


def _next_public_id(db: Session, prefix: str, role: str) -> str:
    existing = {
        public_id
        for (public_id,) in db.query(models.User.public_id).filter(models.User.role == role).all()
    }
    index = len(existing) + 1
    while f"{prefix}{index}" in existing:
        index += 1
    return f"{prefix}{index}"


@router.post("/patients", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register_patient(payload: schemas.PatientRegisterRequest, db: Session = Depends(get_db)) -> schemas.UserRead:
    normalized_login = payload.login.strip()
    duplicate = db.query(models.User).filter(models.User.login == normalized_login).first()
    if duplicate is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Login already exists")

    user = models.User(
        public_id=_next_public_id(db, "p", models.ROLE_PATIENT),
        role=models.ROLE_PATIENT,
        login=normalized_login,
        password_hash=auth.hash_password(payload.password),
        first_name=payload.firstName.strip(),
        last_name=payload.lastName.strip(),
        patronymic=payload.patronymic.strip() if payload.patronymic else None,
        email=payload.email.strip() if payload.email else None,
        phone=payload.phone.strip() if payload.phone else None,
    )
    record = models.MedicalRecord(
        patient=user,
        chronic_diseases="Нет данных",
        allergies="Нет данных",
        important_notes="Нет данных",
        blood_type="Не указана",
        blood_pressure="Не указано",
        immunizations="Нет данных",
        lifestyle="Нет данных",
        restrictions="Нет данных",
        risk_factors="Нет данных",
        emergency_contact="Нет данных",
    )
    db.add_all([user, record])
    db.commit()
    db.refresh(user)
    return user_to_read(user)


@router.patch("/me", response_model=schemas.UserRead)
def update_me(
    payload: schemas.UserUpdateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
) -> schemas.UserRead:
    updates = payload.model_dump(exclude_unset=True)
    field_map = {
        "firstName": "first_name",
        "lastName": "last_name",
        "patronymic": "patronymic",
        "email": "email",
        "phone": "phone",
    }
    for incoming_name, model_name in field_map.items():
        if incoming_name in updates:
            value = updates[incoming_name]
            setattr(current_user, model_name, value.strip() if isinstance(value, str) else value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return user_to_read(current_user)


@router.patch("/patients/{patient_public_id}/medical-record", response_model=schemas.MedicalRecordRead)
def update_medical_record(
    patient_public_id: str,
    payload: schemas.MedicalRecordUpdateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
) -> schemas.MedicalRecordRead:
    if current_user.role == models.ROLE_PATIENT and current_user.public_id != patient_public_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    patient = (
        db.query(models.User)
        .filter(models.User.public_id == patient_public_id, models.User.role == models.ROLE_PATIENT)
        .first()
    )
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    record = patient.medical_record
    if record is None:
        record = models.MedicalRecord(patient=patient)
        db.add(record)

    updates = payload.model_dump(exclude_unset=True)
    if "chronicDiseases" in updates:
        record.chronic_diseases = updates["chronicDiseases"]
    if "allergies" in updates:
        record.allergies = updates["allergies"]
    if "importantNotes" in updates:
        record.important_notes = updates["importantNotes"]
    if "bloodType" in updates:
        record.blood_type = updates["bloodType"]
    if "bloodPressure" in updates:
        record.blood_pressure = updates["bloodPressure"]
    if "heightCm" in updates:
        record.height_cm = updates["heightCm"]
    if "weightKg" in updates:
        record.weight_kg = updates["weightKg"]
    if "immunizations" in updates:
        record.immunizations = updates["immunizations"]
    if "lifestyle" in updates:
        record.lifestyle = updates["lifestyle"]
    if "restrictions" in updates:
        record.restrictions = updates["restrictions"]
    if "riskFactors" in updates:
        record.risk_factors = updates["riskFactors"]
    if "emergencyContact" in updates:
        record.emergency_contact = updates["emergencyContact"]

    db.commit()
    db.refresh(record)
    return medical_record_to_read(record)
