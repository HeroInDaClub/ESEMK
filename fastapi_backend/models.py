from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from .database import Base


ROLE_PATIENT = "patient"
ROLE_DOCTOR = "doctor"
ROLE_ADMIN = "admin"

STATUS_WAITING = "waiting"
STATUS_ACCEPTED = "accepted"
STATUS_NO_SHOW = "no_show"
STATUS_COMPLETED = "completed"
STATUS_CANCELLED = "cancelled"

APPOINTMENT_STATUSES = {
    STATUS_WAITING,
    STATUS_ACCEPTED,
    STATUS_NO_SHOW,
    STATUS_COMPLETED,
    STATUS_CANCELLED,
}


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


doctor_organization = Table(
    "app_doctor_organization",
    Base.metadata,
    Column("doctor_profile_id", ForeignKey("app_doctor_profiles.id"), primary_key=True),
    Column("organization_id", ForeignKey("app_organizations.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "app_users"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(32), unique=True, nullable=False, index=True)
    role = Column(String(24), nullable=False, index=True)
    login = Column(String(245), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    patronymic = Column(String(80), nullable=True)
    email = Column(String(245), nullable=True)
    phone = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    medical_record = relationship("MedicalRecord", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    patient_appointments = relationship(
        "Appointment",
        back_populates="patient",
        foreign_keys="Appointment.patient_id",
        cascade="all, delete-orphan",
    )
    doctor_appointments = relationship(
        "Appointment",
        back_populates="doctor",
        foreign_keys="Appointment.doctor_id",
        cascade="all, delete-orphan",
    )


class Organization(Base):
    __tablename__ = "app_organizations"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(32), unique=True, nullable=False, index=True)
    name = Column(String(160), nullable=False)
    address = Column(String(255), nullable=False)
    photo_url = Column(String(512), nullable=False)
    rating = Column(Float, default=0, nullable=False)

    doctors = relationship("DoctorProfile", secondary=doctor_organization, back_populates="organizations")
    appointments = relationship("Appointment", back_populates="organization")


class DoctorProfile(Base):
    __tablename__ = "app_doctor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("app_users.id"), unique=True, nullable=False)
    specialty = Column(String(120), nullable=False)
    education = Column(String(255), nullable=False)
    rating = Column(Float, default=0, nullable=False)
    photo_url = Column(String(512), nullable=False)

    user = relationship("User", back_populates="doctor_profile")
    organizations = relationship("Organization", secondary=doctor_organization, back_populates="doctors")


class MedicalRecord(Base):
    __tablename__ = "app_medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("app_users.id"), unique=True, nullable=False)
    chronic_diseases = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    important_notes = Column(Text, nullable=True)
    blood_type = Column(String(16), nullable=True)
    blood_pressure = Column(String(32), nullable=True)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    immunizations = Column(Text, nullable=True)
    lifestyle = Column(Text, nullable=True)
    restrictions = Column(Text, nullable=True)
    risk_factors = Column(Text, nullable=True)
    emergency_contact = Column(String(160), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    patient = relationship("User", back_populates="medical_record")


class Appointment(Base):
    __tablename__ = "app_appointments"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(32), unique=True, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("app_users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("app_users.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("app_organizations.id"), nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(24), default=STATUS_WAITING, nullable=False, index=True)
    reason = Column(Text, nullable=True)
    room = Column(String(32), nullable=False)
    diagnosis = Column(Text, nullable=True)
    treatment_plan = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    patient = relationship("User", back_populates="patient_appointments", foreign_keys=[patient_id])
    doctor = relationship("User", back_populates="doctor_appointments", foreign_keys=[doctor_id])
    organization = relationship("Organization", back_populates="appointments")
