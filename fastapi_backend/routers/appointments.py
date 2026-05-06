from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from .. import auth, models, schemas
from ..database import get_db
from ..serializers import appointment_to_read


router = APIRouter(prefix="/appointments", tags=["appointments"])


def _next_appointment_public_id(db: Session) -> str:
    existing = {public_id for (public_id,) in db.query(models.Appointment.public_id).all()}
    index = len(existing) + 1
    while f"a{index}" in existing:
        index += 1
    return f"a{index}"


def _load_appointment(db: Session, appointment_public_id: str) -> models.Appointment:
    appointment = (
        db.query(models.Appointment)
        .options(
            joinedload(models.Appointment.patient),
            joinedload(models.Appointment.doctor),
            joinedload(models.Appointment.organization),
        )
        .filter(models.Appointment.public_id == appointment_public_id)
        .first()
    )
    if appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


def _room_for(doctor: models.User, scheduled_at: datetime) -> str:
    seed = doctor.id * 37 + scheduled_at.day * 11 + scheduled_at.hour
    return str(100 + seed % 300)


@router.post("/", response_model=schemas.AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: schemas.AppointmentCreateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
) -> schemas.AppointmentRead:
    auth.require_role(current_user, models.ROLE_PATIENT)

    try:
        scheduled_at = datetime.strptime(f"{payload.date} {payload.time}", "%Y-%m-%d %H:%M")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid date or time") from exc

    doctor = (
        db.query(models.User)
        .filter(models.User.public_id == payload.doctorId, models.User.role == models.ROLE_DOCTOR)
        .first()
    )
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    organization = db.query(models.Organization).filter(models.Organization.public_id == payload.orgId).first()
    if organization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    if doctor.doctor_profile is None or organization not in doctor.doctor_profile.organizations:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Doctor does not work in this organization")

    busy_slot = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.scheduled_at == scheduled_at,
            models.Appointment.status.in_([models.STATUS_WAITING, models.STATUS_ACCEPTED]),
        )
        .first()
    )
    if busy_slot is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This time slot is already booked")

    appointment = models.Appointment(
        public_id=_next_appointment_public_id(db),
        patient=current_user,
        doctor=doctor,
        organization=organization,
        scheduled_at=scheduled_at,
        status=models.STATUS_WAITING,
        reason=payload.reason.strip() if payload.reason else None,
        room=_room_for(doctor, scheduled_at),
    )
    db.add(appointment)
    db.commit()
    appointment = _load_appointment(db, appointment.public_id)
    return appointment_to_read(appointment)


@router.patch("/{appointment_public_id}", response_model=schemas.AppointmentRead)
def update_appointment(
    appointment_public_id: str,
    payload: schemas.AppointmentUpdateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
) -> schemas.AppointmentRead:
    appointment = _load_appointment(db, appointment_public_id)
    is_patient_owner = current_user.role == models.ROLE_PATIENT and appointment.patient_id == current_user.id
    is_doctor_owner = current_user.role == models.ROLE_DOCTOR and appointment.doctor_id == current_user.id
    is_admin = current_user.role == models.ROLE_ADMIN
    if not is_patient_owner and not is_doctor_owner and not is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    updates = payload.model_dump(exclude_unset=True)
    new_status = updates.get("status")

    if is_patient_owner:
        allowed_fields = {"status"}
        if set(updates) - allowed_fields:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients can only cancel appointments")
        if new_status != models.STATUS_CANCELLED:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Patient status update must be cancelled")

    if new_status is not None:
        appointment.status = new_status
    if is_doctor_owner or is_admin:
        if "reason" in updates:
            appointment.reason = updates["reason"]
        if "diagnosis" in updates:
            appointment.diagnosis = updates["diagnosis"]
        if "treatmentPlan" in updates:
            appointment.treatment_plan = updates["treatmentPlan"]
        if "comments" in updates:
            appointment.comments = updates["comments"]

    db.add(appointment)
    db.commit()
    appointment = _load_appointment(db, appointment.public_id)
    return appointment_to_read(appointment)
