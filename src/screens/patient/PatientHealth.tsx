import { Activity, AlertTriangle, BadgeCheck, ClipboardList, Droplets, HeartPulse, Phone, Ruler, Scale, ShieldAlert, Syringe, UserRound } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';

function valueOrFallback(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return 'Нет данных';
  return value;
}

function parseBloodPressure(value?: string | null) {
  const match = value?.match(/(\d{2,3})\s*[/\\]\s*(\d{2,3})/);
  if (!match) return null;
  return {
    systolic: Number(match[1]),
    diastolic: Number(match[2]),
  };
}

function pressureSummary(value?: string | null) {
  const parsed = parseBloodPressure(value);
  if (!parsed) {
    return {
      label: 'Нет данных',
      tone: 'bg-gray-50 text-gray-600 border-gray-100',
      text: 'Добавьте последнее измерение в медкарту',
    };
  }

  const isNormal = parsed.systolic >= 90 && parsed.systolic <= 129 && parsed.diastolic >= 60 && parsed.diastolic <= 84;
  const isBorderline = parsed.systolic <= 139 && parsed.diastolic <= 89;

  if (isNormal) {
    return {
      label: 'В норме',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      text: `${parsed.systolic}/${parsed.diastolic} мм рт. ст.`,
    };
  }

  return {
    label: isBorderline ? 'Нужен контроль' : 'Требует внимания',
    tone: isBorderline ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100',
    text: `${parsed.systolic}/${parsed.diastolic} мм рт. ст.`,
  };
}

function bmiSummary(heightCm?: number | null, weightKg?: number | null) {
  if (!heightCm || !weightKg) {
    return {
      value: 'Нет данных',
      label: 'Нет данных',
      tone: 'bg-gray-50 text-gray-600 border-gray-100',
    };
  }

  const bmi = weightKg / ((heightCm / 100) ** 2);
  const rounded = bmi.toFixed(1);
  if (bmi < 18.5) {
    return { value: rounded, label: 'Ниже нормы', tone: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
  if (bmi <= 24.9) {
    return { value: rounded, label: 'В норме', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }
  if (bmi <= 29.9) {
    return { value: rounded, label: 'Выше нормы', tone: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
  return { value: rounded, label: 'Требует контроля', tone: 'bg-red-50 text-red-700 border-red-100' };
}

export default function PatientHealth() {
  const { currentUser, medicalRecords, appointments, doctors, users } = useAppContext();

  if (!currentUser) return null;

  const record = medicalRecords.find(item => item.patientId === currentUser.id);
  const pressure = pressureSummary(record?.bloodPressure);
  const bmi = bmiSummary(record?.heightCm, record?.weightKg);
  const myAppointments = appointments.filter(item => item.patientId === currentUser.id);
  const completedVisits = myAppointments
    .filter(item => item.status === 'completed')
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  const nextVisit = myAppointments
    .filter(item => item.status === 'waiting' || item.status === 'accepted')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())[0];
  const lastVisit = completedVisits[0];
  const lastDoctorProfile = lastVisit ? doctors.find(item => item.userId === lastVisit.doctorId) : null;
  const lastDoctorUser = lastVisit ? users.find(item => item.id === lastVisit.doctorId) : null;

  const vitals = [
    {
      label: 'Группа крови',
      value: valueOrFallback(record?.bloodType),
      status: record?.bloodType ? 'Указана' : 'Нет данных',
      hint: 'Не оценивается как норма, но важна для экстренной помощи',
      icon: Droplets,
      tone: record?.bloodType ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-100',
    },
    {
      label: 'Давление',
      value: valueOrFallback(record?.bloodPressure),
      status: pressure.label,
      hint: pressure.text,
      icon: HeartPulse,
      tone: pressure.tone,
    },
    {
      label: 'Рост',
      value: record?.heightCm ? `${record.heightCm} см` : 'Нет данных',
      status: 'Антропометрия',
      hint: 'Используется для расчета ИМТ',
      icon: Ruler,
      tone: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    {
      label: 'Вес и ИМТ',
      value: record?.weightKg ? `${record.weightKg} кг` : 'Нет данных',
      status: bmi.label,
      hint: `ИМТ: ${bmi.value}`,
      icon: Scale,
      tone: bmi.tone,
    },
  ];

  const healthBlocks = [
    { title: 'Хронические заболевания', value: record?.chronicDiseases, icon: Activity, tone: 'bg-red-50 text-red-700' },
    { title: 'Аллергии', value: record?.allergies, icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
    { title: 'Индивидуальные ограничения', value: record?.restrictions, icon: ShieldAlert, tone: 'bg-violet-50 text-violet-700' },
    { title: 'Факторы риска', value: record?.riskFactors, icon: ClipboardList, tone: 'bg-slate-50 text-slate-700' },
    { title: 'Вакцинация', value: record?.immunizations, icon: Syringe, tone: 'bg-emerald-50 text-emerald-700' },
    { title: 'Образ жизни', value: record?.lifestyle, icon: BadgeCheck, tone: 'bg-blue-50 text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 space-y-6">
        <header className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-blue-600 font-semibold mb-1">Личная сводка</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {currentUser.lastName} {currentUser.firstName} {currentUser.patronymic}
              </h1>
              <p className="text-sm text-gray-500 mt-2 max-w-2xl">
                Основные показатели, ограничения и заметки из медкарты собраны на одном экране.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 min-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white text-blue-600 flex items-center justify-center">
                  <UserRound size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-blue-700 font-medium">Аккаунт пациента</p>
                  <p className="font-semibold text-gray-900 truncate">{currentUser.login}</p>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>{currentUser.phone || 'Телефон не указан'}</p>
                <p className="truncate">{currentUser.email || 'Email не указан'}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {vitals.map(item => (
            <Card key={item.label} className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{item.value}</p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl border flex items-center justify-center ${item.tone}`}>
                    <item.icon size={21} />
                  </div>
                </div>
                <div className={`inline-flex mt-4 rounded-full border px-2.5 py-1 text-xs font-semibold ${item.tone}`}>
                  {item.status}
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1fr_340px] gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            {healthBlocks.map(block => (
              <Card key={block.title} className="border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${block.tone}`}>
                      <block.icon size={20} />
                    </div>
                    <h2 className="font-bold text-gray-900">{block.title}</h2>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3 min-h-[76px]">
                    {valueOrFallback(block.value)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <h2 className="font-bold text-gray-900 mb-3">Важные пометки</h2>
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-3">
                  {valueOrFallback(record?.importantNotes)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone size={18} className="text-blue-600" />
                  <h2 className="font-bold text-gray-900">Экстренный контакт</h2>
                </div>
                <p className="text-sm text-gray-700">{valueOrFallback(record?.emergencyContact)}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <h2 className="font-bold text-gray-900 mb-3">История</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Последний завершенный прием</p>
                    <p className="font-medium text-gray-900">
                      {lastVisit
                        ? `${format(parseISO(lastVisit.date), 'd MMMM yyyy', { locale: ru })} · ${lastDoctorProfile?.specialty || 'Врач'} ${lastDoctorUser?.lastName || ''}`
                        : 'Нет завершенных приемов'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ближайшая запись</p>
                    <p className="font-medium text-gray-900">
                      {nextVisit ? `${format(parseISO(nextVisit.date), 'd MMMM yyyy', { locale: ru })}, ${nextVisit.time}` : 'Нет активных записей'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
