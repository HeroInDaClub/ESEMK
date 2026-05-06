from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import auth, models, schemas
from ..database import get_db
from ..serializers import doctor_profile_to_read, organization_to_read


router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: models.User = Depends(auth.get_current_user)) -> models.User:
    auth.require_role(current_user, models.ROLE_ADMIN)
    return current_user


def _next_public_id(db: Session, model: type, column_name: str, prefix: str) -> str:
    column = getattr(model, column_name)
    existing = {public_id for (public_id,) in db.query(column).all()}
    index = len(existing) + 1
    while f"{prefix}{index}" in existing:
        index += 1
    return f"{prefix}{index}"


@router.post("/organizations", response_model=schemas.OrganizationRead, status_code=status.HTTP_201_CREATED)
def create_organization(
    payload: schemas.OrganizationCreateRequest,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> schemas.OrganizationRead:
    organization = models.Organization(
        public_id=_next_public_id(db, models.Organization, "public_id", "o"),
        name=payload.name.strip(),
        address=payload.address.strip(),
        photo_url=payload.photo.strip() if payload.photo else "/images/clinic-placeholder.svg",
        rating=payload.rating,
    )
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization_to_read(organization)


@router.delete("/organizations/{organization_public_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_organization(
    organization_public_id: str,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    organization = db.query(models.Organization).filter(models.Organization.public_id == organization_public_id).first()
    if organization is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    db.query(models.Appointment).filter(models.Appointment.organization_id == organization.id).delete(synchronize_session=False)
    db.execute(
        models.doctor_organization.delete().where(
            models.doctor_organization.c.organization_id == organization.id
        )
    )
    db.delete(organization)
    db.commit()


@router.post("/doctors", response_model=schemas.DoctorProfileRead, status_code=status.HTTP_201_CREATED)
def create_doctor(
    payload: schemas.DoctorCreateRequest,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> schemas.DoctorProfileRead:
    duplicate = db.query(models.User).filter(models.User.login == payload.login.strip()).first()
    if duplicate is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Login already exists")

    organizations = (
        db.query(models.Organization)
        .filter(models.Organization.public_id.in_(payload.organizationIds))
        .all()
    )
    if len(organizations) != len(set(payload.organizationIds)):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="One or more organizations not found")

    user = models.User(
        public_id=_next_public_id(db, models.User, "public_id", "d"),
        role=models.ROLE_DOCTOR,
        login=payload.login.strip(),
        password_hash=auth.hash_password(payload.password),
        first_name=payload.firstName.strip(),
        last_name=payload.lastName.strip(),
        patronymic=payload.patronymic.strip() if payload.patronymic else None,
        email=payload.email.strip() if payload.email else None,
        phone=payload.phone.strip() if payload.phone else None,
    )
    profile = models.DoctorProfile(
        user=user,
        specialty=payload.specialty.strip(),
        education=payload.education.strip(),
        rating=payload.rating,
        photo_url=payload.photo.strip() if payload.photo else "/images/doctor-placeholder.svg",
        organizations=organizations,
    )
    db.add_all([user, profile])
    db.commit()
    db.refresh(profile)
    return doctor_profile_to_read(profile)


@router.delete("/doctors/{doctor_public_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(
    doctor_public_id: str,
    _: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> None:
    doctor = (
        db.query(models.User)
        .filter(models.User.public_id == doctor_public_id, models.User.role == models.ROLE_DOCTOR)
        .first()
    )
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    db.query(models.Appointment).filter(models.Appointment.doctor_id == doctor.id).delete(synchronize_session=False)
    if doctor.doctor_profile is not None:
        doctor.doctor_profile.organizations.clear()
    db.delete(doctor)
    db.commit()
