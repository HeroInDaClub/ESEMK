from . import models, schemas


def user_to_read(user: models.User) -> schemas.UserRead:
    return schemas.UserRead(
        id=user.public_id,
        role=user.role,  # type: ignore[arg-type]
        login=user.login,
        firstName=user.first_name,
        lastName=user.last_name,
        patronymic=user.patronymic,
        email=user.email,
        phone=user.phone,
    )


def organization_to_read(organization: models.Organization) -> schemas.OrganizationRead:
    return schemas.OrganizationRead(
        id=organization.public_id,
        name=organization.name,
        address=organization.address,
        photo=organization.photo_url,
        rating=organization.rating,
    )


def doctor_profile_to_read(profile: models.DoctorProfile) -> schemas.DoctorProfileRead:
    return schemas.DoctorProfileRead(
        userId=profile.user.public_id,
        specialty=profile.specialty,
        education=profile.education,
        rating=profile.rating,
        photo=profile.photo_url,
        organizations=[organization.public_id for organization in profile.organizations],
    )


def medical_record_to_read(record: models.MedicalRecord) -> schemas.MedicalRecordRead:
    return schemas.MedicalRecordRead(
        patientId=record.patient.public_id,
        chronicDiseases=record.chronic_diseases,
        allergies=record.allergies,
        importantNotes=record.important_notes,
        bloodType=record.blood_type,
        bloodPressure=record.blood_pressure,
        heightCm=record.height_cm,
        weightKg=record.weight_kg,
        immunizations=record.immunizations,
        lifestyle=record.lifestyle,
        restrictions=record.restrictions,
        riskFactors=record.risk_factors,
        emergencyContact=record.emergency_contact,
    )


def appointment_to_read(appointment: models.Appointment) -> schemas.AppointmentRead:
    scheduled_at = appointment.scheduled_at
    return schemas.AppointmentRead(
        id=appointment.public_id,
        patientId=appointment.patient.public_id,
        doctorId=appointment.doctor.public_id,
        orgId=appointment.organization.public_id,
        date=scheduled_at.date().isoformat(),
        time=scheduled_at.strftime("%H:%M"),
        status=appointment.status,  # type: ignore[arg-type]
        reason=appointment.reason,
        room=appointment.room,
        diagnosis=appointment.diagnosis,
        treatmentPlan=appointment.treatment_plan,
        comments=appointment.comments,
    )


def bootstrap_to_read(
    users: list[models.User],
    organizations: list[models.Organization],
    doctors: list[models.DoctorProfile],
    medical_records: list[models.MedicalRecord],
    appointments: list[models.Appointment],
) -> schemas.BootstrapResponse:
    return schemas.BootstrapResponse(
        users=[user_to_read(user) for user in users],
        organizations=[organization_to_read(organization) for organization in organizations],
        doctors=[doctor_profile_to_read(doctor) for doctor in doctors],
        medicalRecords=[medical_record_to_read(record) for record in medical_records],
        appointments=[appointment_to_read(appointment) for appointment in appointments],
    )
