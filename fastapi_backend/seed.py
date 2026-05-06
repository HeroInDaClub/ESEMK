from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from . import models
from .auth import hash_password


def _scheduled(day: date, value: str) -> datetime:
    hours, minutes = value.split(":")
    return datetime.combine(day, time(hour=int(hours), minute=int(minutes)))


def _ensure_additional_demo_data(db: Session) -> None:
    org_by_public_id = {org.public_id: org for org in db.query(models.Organization).all()}

    patient_specs = [
        (
            "p7",
            "patient7",
            "Михаил",
            "Громов",
            "Ильич",
            "mikhail@example.com",
            "+7 (999) 789-01-23",
            {
                "chronic_diseases": "Мигрень",
                "allergies": "Нет",
                "important_notes": "Триггер - недосып и яркий свет",
                "blood_type": "B(III) Rh-",
                "blood_pressure": "116/74",
                "height_cm": 176,
                "weight_kg": 73,
                "immunizations": "Грипп 2025",
                "lifestyle": "Нерегулярный сон, работа за экраном",
                "restrictions": "Избегать ночных смен и обезвоживания",
                "risk_factors": "Частые головные боли при стрессе",
                "emergency_contact": "Ирина Громова, +7 (999) 789-01-24",
            },
        ),
        (
            "p8",
            "patient8",
            "Светлана",
            "Андреева",
            "Юрьевна",
            "svetlana@example.com",
            "+7 (999) 890-12-34",
            {
                "chronic_diseases": "Нет",
                "allergies": "Амброзия",
                "important_notes": "Сезонная антигистаминная терапия",
                "blood_type": "A(II) Rh+",
                "blood_pressure": "112/72",
                "height_cm": 168,
                "weight_kg": 64,
                "immunizations": "Грипп 2025, COVID-19 2024",
                "lifestyle": "Йога, плавание",
                "restrictions": "Контроль аллергии в августе-сентябре",
                "risk_factors": "Сезонный ринит",
                "emergency_contact": "Юрий Андреев, +7 (999) 890-12-35",
            },
        ),
        (
            "p9",
            "patient9",
            "Денис",
            "Егоров",
            "Станиславович",
            "denis@example.com",
            "+7 (999) 901-23-45",
            {
                "chronic_diseases": "Гастрит",
                "allergies": "НПВС",
                "important_notes": "Не принимать ибупрофен без защиты желудка",
                "blood_type": "O(I) Rh+",
                "blood_pressure": "126/80",
                "height_cm": 180,
                "weight_kg": 79,
                "immunizations": "Грипп 2025",
                "lifestyle": "Нерегулярное питание",
                "restrictions": "Избегать НПВС и длительных перерывов в еде",
                "risk_factors": "Обострения при стрессе",
                "emergency_contact": "Марина Егорова, +7 (999) 901-23-46",
            },
        ),
        (
            "p10",
            "patient10",
            "Алина",
            "Павлова",
            "Максимовна",
            "alina@example.com",
            "+7 (999) 012-34-56",
            {
                "chronic_diseases": "Нет",
                "allergies": "Нет",
                "important_notes": "Профилактические осмотры без особенностей",
                "blood_type": "AB(IV) Rh-",
                "blood_pressure": "114/72",
                "height_cm": 172,
                "weight_kg": 60,
                "immunizations": "Грипп 2025, ВПЧ 2023",
                "lifestyle": "Активный образ жизни",
                "restrictions": "Нет индивидуальных ограничений",
                "risk_factors": "Низкий текущий риск",
                "emergency_contact": "Максим Павлов, +7 (999) 012-34-57",
            },
        ),
    ]

    users_by_public_id = {user.public_id: user for user in db.query(models.User).all()}

    for public_id, login, first_name, last_name, patronymic, email, phone, record_fields in patient_specs:
        user = users_by_public_id.get(public_id) or db.query(models.User).filter(models.User.login == login).first()
        if user is None:
            user = models.User(
                public_id=public_id,
                role=models.ROLE_PATIENT,
                login=login,
                password_hash=hash_password("123"),
                first_name=first_name,
                last_name=last_name,
                patronymic=patronymic,
                email=email,
                phone=phone,
            )
            db.add(user)
            users_by_public_id[public_id] = user
            db.flush()

        if user.medical_record is None:
            db.add(models.MedicalRecord(patient=user, **record_fields))
        else:
            for field_name, value in record_fields.items():
                if getattr(user.medical_record, field_name, None) in (None, "", "Нет данных", "Не указана", "Не указано"):
                    setattr(user.medical_record, field_name, value)

    doctor_specs = [
        ("d9", "doctor9", "Георгий", "Тарасов", "Олегович", "georgy@example.com", "+7 (999) 888-99-10", "Гастроэнтеролог", "МГМСУ им. Евдокимова, 2014", 4.6, "doc9", ["o5", "o2"]),
        ("d10", "doctor10", "Полина", "Рябова", "Семеновна", "polina@example.com", "+7 (999) 999-10-11", "Дерматолог", "РНИМУ им. Пирогова, 2017", 4.8, "doc10", ["o3", "o6"]),
        ("d11", "doctor11", "Артур", "Мельников", "Денисович", "artur@example.com", "+7 (999) 101-11-12", "ЛОР", "СПбГПМУ, 2012", 4.7, "doc11", ["o4", "o1"]),
        ("d12", "doctor12", "Лариса", "Захарова", "Витальевна", "larisa@example.com", "+7 (999) 202-22-23", "Психотерапевт", "МГППУ, 2010", 4.9, "doc12", ["o6", "o5"]),
    ]

    for public_id, login, first_name, last_name, patronymic, email, phone, specialty, education, rating, seed, org_ids in doctor_specs:
        user = users_by_public_id.get(public_id) or db.query(models.User).filter(models.User.login == login).first()
        if user is None:
            user = models.User(
                public_id=public_id,
                role=models.ROLE_DOCTOR,
                login=login,
                password_hash=hash_password("123"),
                first_name=first_name,
                last_name=last_name,
                patronymic=patronymic,
                email=email,
                phone=phone,
            )
            db.add(user)
            users_by_public_id[public_id] = user
            db.flush()

        organizations = [org_by_public_id[org_id] for org_id in org_ids if org_id in org_by_public_id]
        if user.doctor_profile is None:
            db.add(
                models.DoctorProfile(
                    user=user,
                    specialty=specialty,
                    education=education,
                    rating=rating,
                    photo_url=f"/images/{seed}.webp",
                    organizations=organizations,
                )
            )
        else:
            user.doctor_profile.specialty = specialty
            user.doctor_profile.education = education
            user.doctor_profile.rating = rating
            user.doctor_profile.photo_url = user.doctor_profile.photo_url or f"/images/{seed}.webp"
            if organizations:
                user.doctor_profile.organizations = organizations

    db.flush()

    today = date.today()
    users_by_public_id = {user.public_id: user for user in db.query(models.User).all()}
    appointments = [
        ("a13", "p7", "d12", "o6", today + timedelta(days=1), "15:00", models.STATUS_WAITING, "Повышенная тревожность и нарушение сна", "509", None, None, None),
        ("a14", "p8", "d10", "o3", today + timedelta(days=4), "11:30", models.STATUS_WAITING, "Аллергическая сыпь", "318", None, None, None),
        ("a15", "p9", "d9", "o5", today - timedelta(days=6), "13:30", models.STATUS_COMPLETED, "Боли в желудке", "226", "Хронический гастрит вне обострения", "Диета, ингибитор протонной помпы 14 дней, контроль при ухудшении", "Исключить НПВС и поздние приемы пищи"),
        ("a16", "p10", "d11", "o1", today + timedelta(days=2), "09:00", models.STATUS_WAITING, "Заложенность носа", "144", None, None, None),
    ]

    for public_id, patient_id, doctor_id, org_id, day, value, status, reason, room, diagnosis, treatment_plan, comments in appointments:
        exists = db.query(models.Appointment).filter(models.Appointment.public_id == public_id).first()
        if exists is not None:
            continue
        patient = users_by_public_id.get(patient_id)
        doctor = users_by_public_id.get(doctor_id)
        organization = org_by_public_id.get(org_id)
        if patient is None or doctor is None or organization is None:
            continue
        db.add(
            models.Appointment(
                public_id=public_id,
                patient=patient,
                doctor=doctor,
                organization=organization,
                scheduled_at=_scheduled(day, value),
                status=status,
                reason=reason,
                room=room,
                diagnosis=diagnosis,
                treatment_plan=treatment_plan,
                comments=comments,
            )
        )

    db.commit()


def seed_demo_data(db: Session) -> None:
    if db.query(models.User).count() > 0:
        admin_exists = db.query(models.User).filter(models.User.login == "admin").first()
        if admin_exists is None:
            db.add(
                models.User(
                    public_id="admin1",
                    role=models.ROLE_ADMIN,
                    login="admin",
                    password_hash=hash_password("123"),
                    first_name="Администратор",
                    last_name="MedConnect",
                    patronymic=None,
                    email="admin@medconnect.local",
                    phone="+7 (999) 000-00-00",
                )
            )
            db.commit()
        _ensure_additional_demo_data(db)
        return

    organizations = [
        models.Organization(
            public_id="o1",
            name="Клиника Здоровье",
            address="г. Москва, ул. Ленина, д. 10",
            photo_url="/images/clinic-1.webp",
            rating=4.8,
        ),
        models.Organization(
            public_id="o2",
            name='Медицинский центр "Пульс"',
            address="г. Москва, пр. Мира, д. 25",
            photo_url="/images/clinic-2.webp",
            rating=4.5,
        ),
        models.Organization(
            public_id="o3",
            name='Семейная клиника "Добромед"',
            address="г. Москва, ул. Тверская, д. 15",
            photo_url="/images/clinic-3.webp",
            rating=4.9,
        ),
        models.Organization(
            public_id="o4",
            name="Городская поликлиника №1",
            address="г. Москва, ул. Садовая, д. 5",
            photo_url="/images/clinic-4.webp",
            rating=4.2,
        ),
        models.Organization(
            public_id="o5",
            name='Диагностический центр "Орбита"',
            address="г. Москва, ул. Академика Королева, д. 18",
            photo_url="/images/clinic-5.webp",
            rating=4.7,
        ),
        models.Organization(
            public_id="o6",
            name='Клиника восстановительной медицины "Баланс"',
            address="г. Москва, Ленинградский проспект, д. 41",
            photo_url="/images/clinic-6.webp",
            rating=4.6,
        ),
    ]
    db.add_all(organizations)
    db.flush()
    org_by_public_id = {organization.public_id: organization for organization in organizations}

    patient_specs = [
        ("p1", "patient1", "Иван", "Иванов", "Иванович", "ivan@example.com", "+7 (999) 123-45-67"),
        ("p2", "patient2", "Елена", "Соколова", "Дмитриевна", "elena@example.com", "+7 (999) 234-56-78"),
        ("p3", "patient3", "Алексей", "Морозов", "Викторович", "alexey@example.com", "+7 (999) 345-67-89"),
        ("p4", "patient4", "Наталья", "Кузнецова", "Олеговна", "natalia@example.com", "+7 (999) 456-78-90"),
        ("p5", "patient5", "Роман", "Федоров", "Андреевич", "roman@example.com", "+7 (999) 567-89-01"),
        ("p6", "patient6", "Ольга", "Белова", "Павловна", "olga@example.com", "+7 (999) 678-90-12"),
        ("p7", "patient7", "Михаил", "Громов", "Ильич", "mikhail@example.com", "+7 (999) 789-01-23"),
        ("p8", "patient8", "Светлана", "Андреева", "Юрьевна", "svetlana@example.com", "+7 (999) 890-12-34"),
        ("p9", "patient9", "Денис", "Егоров", "Станиславович", "denis@example.com", "+7 (999) 901-23-45"),
        ("p10", "patient10", "Алина", "Павлова", "Максимовна", "alina@example.com", "+7 (999) 012-34-56"),
    ]
    doctor_specs = [
        ("d1", "doctor1", "Петр", "Петров", "Сергеевич", "petr@example.com", "+7 (999) 765-43-21", "Терапевт", "МГМУ им. Сеченова, 2010", 4.9, "doc1", ["o1", "o2"]),
        ("d2", "doctor2", "Анна", "Смирнова", "Игоревна", "anna@example.com", "+7 (999) 111-22-33", "Кардиолог", "РНИМУ им. Пирогова, 2012", 4.7, "doc2", ["o1", "o3"]),
        ("d3", "doctor3", "Сергей", "Волков", "Александрович", "sergey@example.com", "+7 (999) 222-33-44", "Невролог", "СПбГПМУ, 2015", 4.8, "doc3", ["o2", "o4"]),
        ("d4", "doctor4", "Мария", "Лебедева", "Константиновна", "maria@example.com", "+7 (999) 333-44-55", "Хирург", "МГМСУ им. Евдокимова, 2008", 4.6, "doc4", ["o3"]),
        ("d5", "doctor5", "Дмитрий", "Козлов", "Владимирович", "dmitry@example.com", "+7 (999) 444-55-66", "Офтальмолог", "РМАНПО, 2014", 4.9, "doc5", ["o1", "o4"]),
        ("d6", "doctor6", "Екатерина", "Новикова", "Андреевна", "ekaterina@example.com", "+7 (999) 555-66-77", "Педиатр", "РНИМУ им. Пирогова, 2016", 5.0, "doc6", ["o3", "o2"]),
        ("d7", "doctor7", "Илья", "Орлов", "Михайлович", "ilya@example.com", "+7 (999) 666-77-88", "Эндокринолог", "МГУ им. Ломоносова, факультет фундаментальной медицины, 2013", 4.8, "doc7", ["o5", "o1"]),
        ("d8", "doctor8", "Виктория", "Сафонова", "Романовна", "victoria@example.com", "+7 (999) 777-88-99", "Реабилитолог", "РНИМУ им. Пирогова, 2011", 4.7, "doc8", ["o6", "o4"]),
        ("d9", "doctor9", "Георгий", "Тарасов", "Олегович", "georgy@example.com", "+7 (999) 888-99-10", "Гастроэнтеролог", "МГМСУ им. Евдокимова, 2014", 4.6, "doc9", ["o5", "o2"]),
        ("d10", "doctor10", "Полина", "Рябова", "Семеновна", "polina@example.com", "+7 (999) 999-10-11", "Дерматолог", "РНИМУ им. Пирогова, 2017", 4.8, "doc10", ["o3", "o6"]),
        ("d11", "doctor11", "Артур", "Мельников", "Денисович", "artur@example.com", "+7 (999) 101-11-12", "ЛОР", "СПбГПМУ, 2012", 4.7, "doc11", ["o4", "o1"]),
        ("d12", "doctor12", "Лариса", "Захарова", "Витальевна", "larisa@example.com", "+7 (999) 202-22-23", "Психотерапевт", "МГППУ, 2010", 4.9, "doc12", ["o6", "o5"]),
    ]

    admin = models.User(
        public_id="admin1",
        role=models.ROLE_ADMIN,
        login="admin",
        password_hash=hash_password("123"),
        first_name="Администратор",
        last_name="MedConnect",
        patronymic=None,
        email="admin@medconnect.local",
        phone="+7 (999) 000-00-00",
    )
    db.add(admin)

    users_by_public_id: dict[str, models.User] = {}
    for public_id, login, first_name, last_name, patronymic, email, phone in patient_specs:
        user = models.User(
            public_id=public_id,
            role=models.ROLE_PATIENT,
            login=login,
            password_hash=hash_password("123"),
            first_name=first_name,
            last_name=last_name,
            patronymic=patronymic,
            email=email,
            phone=phone,
        )
        db.add(user)
        users_by_public_id[public_id] = user

    for public_id, login, first_name, last_name, patronymic, email, phone, specialty, education, rating, seed, org_ids in doctor_specs:
        user = models.User(
            public_id=public_id,
            role=models.ROLE_DOCTOR,
            login=login,
            password_hash=hash_password("123"),
            first_name=first_name,
            last_name=last_name,
            patronymic=patronymic,
            email=email,
            phone=phone,
        )
        profile = models.DoctorProfile(
            user=user,
            specialty=specialty,
            education=education,
            rating=rating,
            photo_url=f"/images/{seed}.webp",
            organizations=[org_by_public_id[org_id] for org_id in org_ids],
        )
        db.add_all([user, profile])
        users_by_public_id[public_id] = user

    db.flush()

    medical_records = [
        models.MedicalRecord(
            patient=users_by_public_id["p1"],
            chronic_diseases="Гипертония 1 степени",
            allergies="Пенициллин",
            important_notes="Плохо переносит наркоз",
            blood_type="A(II) Rh+",
            blood_pressure="128/82",
            height_cm=178,
            weight_kg=82,
            immunizations="Грипп 2025, COVID-19 ревакцинация 2024",
            lifestyle="Умеренная активность, 7 часов сна",
            restrictions="Ограничить соль, контролировать давление утром",
            risk_factors="Семейный анамнез сердечно-сосудистых заболеваний",
            emergency_contact="Мария Иванова, +7 (999) 123-45-68",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p2"],
            chronic_diseases="Бронхиальная астма",
            allergies="Пыльца березы, цитрусовые",
            important_notes="Регулярно принимает ингаляторы",
            blood_type="O(I) Rh+",
            blood_pressure="118/76",
            height_cm=166,
            weight_kg=61,
            immunizations="Грипп 2025",
            lifestyle="Пешие прогулки, избегает интенсивных нагрузок весной",
            restrictions="Не назначать препараты без проверки бронхоспазма",
            risk_factors="Сезонные обострения аллергии",
            emergency_contact="Дмитрий Соколов, +7 (999) 234-56-79",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p3"],
            chronic_diseases="Нет",
            allergies="Нет",
            important_notes="Спортсмен, повышенные физические нагрузки",
            blood_type="B(III) Rh+",
            blood_pressure="116/72",
            height_cm=184,
            weight_kg=78,
            immunizations="Столбняк 2022, грипп 2025",
            lifestyle="Регулярные тренировки 4 раза в неделю",
            restrictions="Контроль восстановления после нагрузок",
            risk_factors="Риск спортивных травм",
            emergency_contact="Ольга Морозова, +7 (999) 345-67-80",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p4"],
            chronic_diseases="Сахарный диабет 2 типа",
            allergies="Йодсодержащие препараты",
            important_notes="Контроль глюкозы перед процедурами",
            blood_type="AB(IV) Rh+",
            blood_pressure="124/80",
            height_cm=170,
            weight_kg=74,
            immunizations="Грипп 2025, пневмококк 2023",
            lifestyle="Диета с контролем углеводов, ежедневная ходьба",
            restrictions="Избегать контрастных исследований без подготовки",
            risk_factors="Повышенный риск сосудистых осложнений",
            emergency_contact="Олег Кузнецов, +7 (999) 456-78-91",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p5"],
            chronic_diseases="Остеохондроз шейного отдела",
            allergies="Нет",
            important_notes="Сидячая работа, рекомендованы перерывы и ЛФК",
            blood_type="A(II) Rh-",
            blood_pressure="122/78",
            height_cm=181,
            weight_kg=86,
            immunizations="Грипп 2024",
            lifestyle="Офисная работа, ЛФК 2 раза в неделю",
            restrictions="Не поднимать тяжести без фиксации плечевого пояса",
            risk_factors="Хроническое мышечное напряжение",
            emergency_contact="Анна Федорова, +7 (999) 567-89-02",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p6"],
            chronic_diseases="Гипотиреоз",
            allergies="Латекс",
            important_notes="Принимает левотироксин утром",
            blood_type="O(I) Rh-",
            blood_pressure="110/70",
            height_cm=164,
            weight_kg=58,
            immunizations="Грипп 2025",
            lifestyle="Стабильный режим сна, утренний прием препарата",
            restrictions="Избегать латексных расходников",
            risk_factors="Колебания ТТГ при нарушении режима приема",
            emergency_contact="Павел Белов, +7 (999) 678-90-13",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p7"],
            chronic_diseases="Мигрень",
            allergies="Нет",
            important_notes="Триггер - недосып и яркий свет",
            blood_type="B(III) Rh-",
            blood_pressure="116/74",
            height_cm=176,
            weight_kg=73,
            immunizations="Грипп 2025",
            lifestyle="Нерегулярный сон, работа за экраном",
            restrictions="Избегать ночных смен и обезвоживания",
            risk_factors="Частые головные боли при стрессе",
            emergency_contact="Ирина Громова, +7 (999) 789-01-24",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p8"],
            chronic_diseases="Нет",
            allergies="Амброзия",
            important_notes="Сезонная антигистаминная терапия",
            blood_type="A(II) Rh+",
            blood_pressure="112/72",
            height_cm=168,
            weight_kg=64,
            immunizations="Грипп 2025, COVID-19 2024",
            lifestyle="Йога, плавание",
            restrictions="Контроль аллергии в августе-сентябре",
            risk_factors="Сезонный ринит",
            emergency_contact="Юрий Андреев, +7 (999) 890-12-35",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p9"],
            chronic_diseases="Гастрит",
            allergies="НПВС",
            important_notes="Не принимать ибупрофен без защиты желудка",
            blood_type="O(I) Rh+",
            blood_pressure="126/80",
            height_cm=180,
            weight_kg=79,
            immunizations="Грипп 2025",
            lifestyle="Нерегулярное питание",
            restrictions="Избегать НПВС и длительных перерывов в еде",
            risk_factors="Обострения при стрессе",
            emergency_contact="Марина Егорова, +7 (999) 901-23-46",
        ),
        models.MedicalRecord(
            patient=users_by_public_id["p10"],
            chronic_diseases="Нет",
            allergies="Нет",
            important_notes="Профилактические осмотры без особенностей",
            blood_type="AB(IV) Rh-",
            blood_pressure="114/72",
            height_cm=172,
            weight_kg=60,
            immunizations="Грипп 2025, ВПЧ 2023",
            lifestyle="Активный образ жизни",
            restrictions="Нет индивидуальных ограничений",
            risk_factors="Низкий текущий риск",
            emergency_contact="Максим Павлов, +7 (999) 012-34-57",
        ),
    ]
    db.add_all(medical_records)

    today = date.today()
    appointments = [
        models.Appointment(
            public_id="a1",
            patient=users_by_public_id["p1"],
            doctor=users_by_public_id["d1"],
            organization=org_by_public_id["o1"],
            scheduled_at=_scheduled(today, "10:00"),
            status=models.STATUS_WAITING,
            reason="Болит голова",
            room="101",
        ),
        models.Appointment(
            public_id="a2",
            patient=users_by_public_id["p1"],
            doctor=users_by_public_id["d2"],
            organization=org_by_public_id["o1"],
            scheduled_at=_scheduled(today - timedelta(days=3), "14:30"),
            status=models.STATUS_COMPLETED,
            reason="Плановый осмотр",
            room="205",
            diagnosis="Здоров",
            treatment_plan="Витамины, контрольный осмотр через год",
            comments="Сохранять режим сна и умеренную физическую активность",
        ),
        models.Appointment(
            public_id="a3",
            patient=users_by_public_id["p2"],
            doctor=users_by_public_id["d1"],
            organization=org_by_public_id["o2"],
            scheduled_at=_scheduled(today, "11:00"),
            status=models.STATUS_WAITING,
            reason="Боли в спине",
            room="302",
        ),
        models.Appointment(
            public_id="a4",
            patient=users_by_public_id["p3"],
            doctor=users_by_public_id["d4"],
            organization=org_by_public_id["o3"],
            scheduled_at=_scheduled(today + timedelta(days=1), "09:15"),
            status=models.STATUS_WAITING,
            reason="Консультация перед операцией",
            room="401",
        ),
        models.Appointment(
            public_id="a5",
            patient=users_by_public_id["p1"],
            doctor=users_by_public_id["d5"],
            organization=org_by_public_id["o4"],
            scheduled_at=_scheduled(today + timedelta(days=2), "16:00"),
            status=models.STATUS_WAITING,
            reason="Ухудшение зрения",
            room="112",
        ),
        models.Appointment(
            public_id="a6",
            patient=users_by_public_id["p2"],
            doctor=users_by_public_id["d6"],
            organization=org_by_public_id["o3"],
            scheduled_at=_scheduled(today - timedelta(days=8), "12:00"),
            status=models.STATUS_COMPLETED,
            reason="Справка в бассейн",
            room="202",
            diagnosis="Здорова",
            treatment_plan="Справка выдана",
        ),
        models.Appointment(
            public_id="a7",
            patient=users_by_public_id["p1"],
            doctor=users_by_public_id["d3"],
            organization=org_by_public_id["o2"],
            scheduled_at=_scheduled(today - timedelta(days=12), "15:45"),
            status=models.STATUS_CANCELLED,
            reason="Мигрень",
            room="305",
        ),
        models.Appointment(
            public_id="a8",
            patient=users_by_public_id["p4"],
            doctor=users_by_public_id["d7"],
            organization=org_by_public_id["o5"],
            scheduled_at=_scheduled(today, "13:00"),
            status=models.STATUS_ACCEPTED,
            reason="Коррекция терапии диабета",
            room="214",
        ),
        models.Appointment(
            public_id="a9",
            patient=users_by_public_id["p5"],
            doctor=users_by_public_id["d8"],
            organization=org_by_public_id["o6"],
            scheduled_at=_scheduled(today + timedelta(days=3), "10:30"),
            status=models.STATUS_WAITING,
            reason="Восстановление после травмы плеча",
            room="118",
        ),
        models.Appointment(
            public_id="a10",
            patient=users_by_public_id["p6"],
            doctor=users_by_public_id["d7"],
            organization=org_by_public_id["o1"],
            scheduled_at=_scheduled(today - timedelta(days=15), "09:30"),
            status=models.STATUS_COMPLETED,
            reason="Контроль гормонов щитовидной железы",
            room="212",
            diagnosis="Компенсированный гипотиреоз",
            treatment_plan="Продолжить текущую дозировку, контроль ТТГ через 3 месяца",
            comments="Препарат принимать строго натощак, анализы сдавать утром",
        ),
        models.Appointment(
            public_id="a11",
            patient=users_by_public_id["p5"],
            doctor=users_by_public_id["d3"],
            organization=org_by_public_id["o4"],
            scheduled_at=_scheduled(today - timedelta(days=4), "17:00"),
            status=models.STATUS_NO_SHOW,
            reason="Онемение пальцев",
            room="306",
        ),
        models.Appointment(
            public_id="a12",
            patient=users_by_public_id["p4"],
            doctor=users_by_public_id["d2"],
            organization=org_by_public_id["o3"],
            scheduled_at=_scheduled(today + timedelta(days=5), "12:30"),
            status=models.STATUS_WAITING,
            reason="Повышенное давление",
            room="207",
        ),
        models.Appointment(
            public_id="a13",
            patient=users_by_public_id["p7"],
            doctor=users_by_public_id["d12"],
            organization=org_by_public_id["o6"],
            scheduled_at=_scheduled(today + timedelta(days=1), "15:00"),
            status=models.STATUS_WAITING,
            reason="Повышенная тревожность и нарушение сна",
            room="509",
        ),
        models.Appointment(
            public_id="a14",
            patient=users_by_public_id["p8"],
            doctor=users_by_public_id["d10"],
            organization=org_by_public_id["o3"],
            scheduled_at=_scheduled(today + timedelta(days=4), "11:30"),
            status=models.STATUS_WAITING,
            reason="Аллергическая сыпь",
            room="318",
        ),
        models.Appointment(
            public_id="a15",
            patient=users_by_public_id["p9"],
            doctor=users_by_public_id["d9"],
            organization=org_by_public_id["o5"],
            scheduled_at=_scheduled(today - timedelta(days=6), "13:30"),
            status=models.STATUS_COMPLETED,
            reason="Боли в желудке",
            room="226",
            diagnosis="Хронический гастрит вне обострения",
            treatment_plan="Диета, ингибитор протонной помпы 14 дней, контроль при ухудшении",
            comments="Исключить НПВС и поздние приемы пищи",
        ),
        models.Appointment(
            public_id="a16",
            patient=users_by_public_id["p10"],
            doctor=users_by_public_id["d11"],
            organization=org_by_public_id["o1"],
            scheduled_at=_scheduled(today + timedelta(days=2), "09:00"),
            status=models.STATUS_WAITING,
            reason="Заложенность носа",
            room="144",
        ),
    ]
    db.add_all(appointments)
    db.commit()
