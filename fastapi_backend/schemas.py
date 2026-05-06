from typing import Literal

from pydantic import BaseModel, Field


Role = Literal["patient", "doctor", "admin"]
AppointmentStatus = Literal["waiting", "accepted", "no_show", "completed", "cancelled"]


class UserRead(BaseModel):
    id: str
    role: Role
    login: str
    firstName: str
    lastName: str
    patronymic: str | None = None
    email: str | None = None
    phone: str | None = None


class OrganizationRead(BaseModel):
    id: str
    name: str
    address: str
    photo: str
    rating: float


class DoctorProfileRead(BaseModel):
    userId: str
    specialty: str
    education: str
    rating: float
    photo: str
    organizations: list[str]


class MedicalRecordRead(BaseModel):
    patientId: str
    chronicDiseases: str | None = None
    allergies: str | None = None
    importantNotes: str | None = None
    bloodType: str | None = None
    bloodPressure: str | None = None
    heightCm: int | None = None
    weightKg: float | None = None
    immunizations: str | None = None
    lifestyle: str | None = None
    restrictions: str | None = None
    riskFactors: str | None = None
    emergencyContact: str | None = None


class AppointmentRead(BaseModel):
    id: str
    patientId: str
    doctorId: str
    orgId: str
    date: str
    time: str
    status: AppointmentStatus
    reason: str | None = None
    room: str
    diagnosis: str | None = None
    treatmentPlan: str | None = None
    comments: str | None = None


class BootstrapResponse(BaseModel):
    users: list[UserRead]
    organizations: list[OrganizationRead]
    doctors: list[DoctorProfileRead]
    medicalRecords: list[MedicalRecordRead]
    appointments: list[AppointmentRead]


class LoginRequest(BaseModel):
    login: str = Field(min_length=1, max_length=245)
    password: str = Field(min_length=1, max_length=245)
    role: Role


class AuthResponse(BaseModel):
    accessToken: str
    user: UserRead


class PatientRegisterRequest(BaseModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    patronymic: str | None = Field(default=None, max_length=80)
    login: str = Field(min_length=3, max_length=245)
    password: str = Field(min_length=3, max_length=245)
    email: str | None = Field(default=None, max_length=245)
    phone: str | None = Field(default=None, max_length=64)


class UserUpdateRequest(BaseModel):
    firstName: str | None = Field(default=None, min_length=1, max_length=80)
    lastName: str | None = Field(default=None, min_length=1, max_length=80)
    patronymic: str | None = Field(default=None, max_length=80)
    email: str | None = Field(default=None, max_length=245)
    phone: str | None = Field(default=None, max_length=64)


class MedicalRecordUpdateRequest(BaseModel):
    chronicDiseases: str | None = None
    allergies: str | None = None
    importantNotes: str | None = None
    bloodType: str | None = None
    bloodPressure: str | None = None
    heightCm: int | None = None
    weightKg: float | None = None
    immunizations: str | None = None
    lifestyle: str | None = None
    restrictions: str | None = None
    riskFactors: str | None = None
    emergencyContact: str | None = None


class OrganizationCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    address: str = Field(min_length=5, max_length=255)
    photo: str | None = Field(default=None, max_length=512)
    rating: float = Field(default=4.5, ge=0, le=5)


class DoctorCreateRequest(BaseModel):
    firstName: str = Field(min_length=1, max_length=80)
    lastName: str = Field(min_length=1, max_length=80)
    patronymic: str | None = Field(default=None, max_length=80)
    login: str = Field(min_length=3, max_length=245)
    password: str = Field(min_length=3, max_length=245)
    email: str | None = Field(default=None, max_length=245)
    phone: str | None = Field(default=None, max_length=64)
    specialty: str = Field(min_length=2, max_length=120)
    education: str = Field(min_length=2, max_length=255)
    rating: float = Field(default=4.6, ge=0, le=5)
    photo: str | None = Field(default=None, max_length=512)
    organizationIds: list[str] = Field(min_length=1)


class AppointmentCreateRequest(BaseModel):
    doctorId: str
    orgId: str
    date: str
    time: str
    reason: str | None = None


class AppointmentUpdateRequest(BaseModel):
    status: AppointmentStatus | None = None
    reason: str | None = None
    diagnosis: str | None = None
    treatmentPlan: str | None = None
    comments: str | None = None
