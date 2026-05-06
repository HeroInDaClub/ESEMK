from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..serializers import (
    appointment_to_read,
    bootstrap_to_read,
    doctor_profile_to_read,
    organization_to_read,
)


router = APIRouter(tags=["catalog"])


@router.get("/bootstrap", response_model=schemas.BootstrapResponse)
def bootstrap(db: Session = Depends(get_db)) -> schemas.BootstrapResponse:
    users = db.query(models.User).order_by(models.User.public_id).all()
    organizations = db.query(models.Organization).order_by(models.Organization.public_id).all()
    doctors = (
        db.query(models.DoctorProfile)
        .options(joinedload(models.DoctorProfile.user), joinedload(models.DoctorProfile.organizations))
        .all()
    )
    medical_records = (
        db.query(models.MedicalRecord)
        .options(joinedload(models.MedicalRecord.patient))
        .all()
    )
    appointments = (
        db.query(models.Appointment)
        .options(
            joinedload(models.Appointment.patient),
            joinedload(models.Appointment.doctor),
            joinedload(models.Appointment.organization),
        )
        .order_by(models.Appointment.scheduled_at.desc())
        .all()
    )
    return bootstrap_to_read(users, organizations, doctors, medical_records, appointments)


@router.get("/doctors", response_model=list[schemas.DoctorProfileRead])
def doctors(db: Session = Depends(get_db)) -> list[schemas.DoctorProfileRead]:
    profiles = (
        db.query(models.DoctorProfile)
        .options(joinedload(models.DoctorProfile.user), joinedload(models.DoctorProfile.organizations))
        .all()
    )
    return [doctor_profile_to_read(profile) for profile in profiles]


@router.get("/organizations", response_model=list[schemas.OrganizationRead])
def organizations(db: Session = Depends(get_db)) -> list[schemas.OrganizationRead]:
    rows = db.query(models.Organization).order_by(models.Organization.name).all()
    return [organization_to_read(row) for row in rows]


@router.get("/appointments", response_model=list[schemas.AppointmentRead])
def appointments(db: Session = Depends(get_db)) -> list[schemas.AppointmentRead]:
    rows = (
        db.query(models.Appointment)
        .options(
            joinedload(models.Appointment.patient),
            joinedload(models.Appointment.doctor),
            joinedload(models.Appointment.organization),
        )
        .order_by(models.Appointment.scheduled_at.desc())
        .all()
    )
    return [appointment_to_read(row) for row in rows]
