import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListChecks,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../AppContext';
import type { Appointment } from '../../mockData';

const statusLabels: Record<Appointment['status'], string> = {
  waiting: 'Ожидает',
  accepted: 'На приеме',
  completed: 'Завершен',
  no_show: 'Не пришел',
  cancelled: 'Отменен',
};

const statusTone: Record<Appointment['status'], string> = {
  waiting: 'bg-amber-50 text-amber-700 border-amber-100',
  accepted: 'bg-blue-50 text-blue-700 border-blue-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  no_show: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
};

type AdminSection = 'appointments' | 'clinics' | 'doctors';

const emptyClinicForm = {
  name: '',
  address: '',
  photo: '',
  rating: '4.7',
};

const emptyDoctorForm = {
  lastName: '',
  firstName: '',
  patronymic: '',
  login: '',
  password: '123',
  email: '',
  phone: '',
  specialty: '',
  education: '',
  rating: '4.8',
  photo: '',
  organizationIds: [] as string[],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    appointments,
    doctors,
    organizations,
    users,
    updateAppointment,
    logout,
    refreshData,
    createOrganization,
    deleteOrganization,
    createDoctor,
    deleteDoctor,
  } = useAppContext();

  const [activeSection, setActiveSection] = useState<AdminSection>('appointments');
  const [filter, setFilter] = useState<Appointment['status'] | 'all'>('all');
  const [clinicForm, setClinicForm] = useState(emptyClinicForm);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'clinic' | 'doctor' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setDoctorForm(prev => {
      const validIds = prev.organizationIds.filter(id => organizations.some(org => org.id === id));
      if (validIds.length === prev.organizationIds.length && validIds.length > 0) return prev;
      return { ...prev, organizationIds: validIds.length > 0 ? validIds : organizations[0] ? [organizations[0].id] : [] };
    });
  }, [organizations]);

  const patients = users.filter(user => user.role === 'patient');
  const doctorUsers = users.filter(user => user.role === 'doctor');
  const today = format(new Date(), 'yyyy-MM-dd');

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(appointment => filter === 'all' || appointment.status === filter)
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
  }, [appointments, filter]);

  const stats = [
    { label: 'Пациенты', value: patients.length, icon: Users, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Врачи', value: doctorUsers.length, icon: Stethoscope, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Клиники', value: organizations.length, icon: Building2, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Сегодня', value: appointments.filter(item => item.date === today).length, icon: CalendarDays, tone: 'bg-amber-50 text-amber-700' },
  ];

  const sections = [
    { id: 'appointments' as const, label: 'Записи', count: appointments.length, icon: ListChecks },
    { id: 'clinics' as const, label: 'Клиники', count: organizations.length, icon: Building2 },
    { id: 'doctors' as const, label: 'Врачи', count: doctorUsers.length, icon: UserPlus },
  ];

  const clearMessages = () => {
    setNotice(null);
    setFormError(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    clearMessages();
    await refreshData();
    setNotice('Данные обновлены');
  };

  const handleCreateClinic = async (event: FormEvent) => {
    event.preventDefault();
    clearMessages();
    setSubmitting('clinic');
    try {
      await createOrganization({
        name: clinicForm.name.trim(),
        address: clinicForm.address.trim(),
        photo: clinicForm.photo.trim() || undefined,
        rating: Number(clinicForm.rating) || 4.5,
      });
      setClinicForm(emptyClinicForm);
      setNotice('Клиника добавлена');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось добавить клинику');
    } finally {
      setSubmitting(null);
    }
  };

  const handleCreateDoctor = async (event: FormEvent) => {
    event.preventDefault();
    clearMessages();
    if (doctorForm.organizationIds.length === 0) {
      setFormError('Выберите хотя бы одну клинику для врача');
      return;
    }

    setSubmitting('doctor');
    try {
      await createDoctor({
        lastName: doctorForm.lastName.trim(),
        firstName: doctorForm.firstName.trim(),
        patronymic: doctorForm.patronymic.trim() || undefined,
        login: doctorForm.login.trim(),
        password: doctorForm.password,
        email: doctorForm.email.trim() || undefined,
        phone: doctorForm.phone.trim() || undefined,
        specialty: doctorForm.specialty.trim(),
        education: doctorForm.education.trim(),
        rating: Number(doctorForm.rating) || 4.6,
        photo: doctorForm.photo.trim() || undefined,
        organizationIds: doctorForm.organizationIds,
      });
      setDoctorForm({ ...emptyDoctorForm, organizationIds: organizations[0] ? [organizations[0].id] : [] });
      setNotice('Врач добавлен');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось добавить врача');
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteClinic = async (id: string, name: string) => {
    if (!window.confirm(`Удалить клинику "${name}"? Связанные записи тоже будут удалены.`)) return;
    clearMessages();
    setBusyId(id);
    try {
      await deleteOrganization(id);
      setNotice('Клиника удалена');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось удалить клинику');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Удалить врача ${name}? Связанные записи тоже будут удалены.`)) return;
    clearMessages();
    setBusyId(id);
    try {
      await deleteDoctor(id);
      setNotice('Врач удален');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Не удалось удалить врача');
    } finally {
      setBusyId(null);
    }
  };

  const toggleDoctorOrganization = (id: string) => {
    setDoctorForm(prev => {
      const isSelected = prev.organizationIds.includes(id);
      const nextIds = isSelected ? prev.organizationIds.filter(item => item !== id) : [...prev.organizationIds, id];
      return { ...prev, organizationIds: nextIds };
    });
  };

  const renderAppointments = () => (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Записи пациентов</h2>
            <p className="text-sm text-gray-500">Администратор может быстро менять статус любого приема</p>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Все статусы</option>
            <option value="waiting">Ожидает</option>
            <option value="accepted">На приеме</option>
            <option value="completed">Завершен</option>
            <option value="no_show">Не пришел</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredAppointments.map(appointment => {
            const patient = users.find(user => user.id === appointment.patientId);
            const doctor = users.find(user => user.id === appointment.doctorId);
            const doctorProfile = doctors.find(profile => profile.userId === appointment.doctorId);
            const org = organizations.find(item => item.id === appointment.orgId);

            return (
              <div key={appointment.id} className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">{format(parseISO(appointment.date), 'd MMMM yyyy', { locale: ru })}, {appointment.time}</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${statusTone[appointment.status]}`}>{statusLabels[appointment.status]}</span>
                  </div>
                  <p className="text-sm text-gray-900">
                    {patient?.lastName} {patient?.firstName} &rarr; {doctor?.lastName} {doctor?.firstName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{doctorProfile?.specialty} · {org?.name} · кабинет {appointment.room}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateAppointment(appointment.id, { status: 'waiting' })}>
                    <Clock size={14} className="mr-1" /> Ожидает
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateAppointment(appointment.id, { status: 'completed' })}>
                    <CheckCircle2 size={14} className="mr-1" /> Завершить
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateAppointment(appointment.id, { status: 'cancelled' })}>
                    <XCircle size={14} className="mr-1" /> Отменить
                  </Button>
                </div>
              </div>
            );
          })}
          {filteredAppointments.length === 0 && (
            <div className="p-10 text-center text-sm text-gray-500">Записей с таким статусом нет</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderClinics = () => (
    <section className="grid lg:grid-cols-[420px_1fr] gap-6">
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Добавить клинику</h2>
          <p className="text-sm text-gray-500 mb-4">После сохранения клиника сразу появится в поиске пациента</p>
          <form onSubmit={handleCreateClinic} className="space-y-3">
            <Input required placeholder="Название" value={clinicForm.name} onChange={e => setClinicForm(prev => ({ ...prev, name: e.target.value }))} />
            <Input required placeholder="Адрес" value={clinicForm.address} onChange={e => setClinicForm(prev => ({ ...prev, address: e.target.value }))} />
            <Input placeholder="/images/clinic-7.webp или https://..." value={clinicForm.photo} onChange={e => setClinicForm(prev => ({ ...prev, photo: e.target.value }))} />
            <Input type="number" min="0" max="5" step="0.1" placeholder="Рейтинг" value={clinicForm.rating} onChange={e => setClinicForm(prev => ({ ...prev, rating: e.target.value }))} />
            <Button type="submit" className="w-full" disabled={submitting === 'clinic'}>
              <Plus size={16} className="mr-2" /> {submitting === 'clinic' ? 'Сохраняем...' : 'Добавить клинику'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Существующие клиники</h2>
            <p className="text-sm text-gray-500">Можно удалить устаревшие карточки и связанные с ними записи</p>
          </div>
          <div className="divide-y divide-gray-100">
            {organizations.map(org => {
              const doctorsCount = doctors.filter(doctor => doctor.organizations.includes(org.id)).length;
              const appointmentsCount = appointments.filter(appointment => appointment.orgId === org.id).length;

              return (
                <div key={org.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{org.name}</p>
                    <p className="text-sm text-gray-500 truncate">{org.address}</p>
                    <p className="text-xs text-gray-400 mt-1">Рейтинг {org.rating} · врачей {doctorsCount} · записей {appointmentsCount}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 md:w-auto"
                    disabled={busyId === org.id}
                    onClick={() => handleDeleteClinic(org.id, org.name)}
                  >
                    <Trash2 size={16} className="mr-2" /> Удалить
                  </Button>
                </div>
              );
            })}
            {organizations.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-500">Клиник пока нет</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );

  const renderDoctors = () => (
    <section className="grid xl:grid-cols-[460px_1fr] gap-6">
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Добавить врача</h2>
          <p className="text-sm text-gray-500 mb-4">Логин и временный пароль можно указать сразу для входа врача</p>
          <form onSubmit={handleCreateDoctor} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Input required placeholder="Фамилия" value={doctorForm.lastName} onChange={e => setDoctorForm(prev => ({ ...prev, lastName: e.target.value }))} />
              <Input required placeholder="Имя" value={doctorForm.firstName} onChange={e => setDoctorForm(prev => ({ ...prev, firstName: e.target.value }))} />
            </div>
            <Input placeholder="Отчество" value={doctorForm.patronymic} onChange={e => setDoctorForm(prev => ({ ...prev, patronymic: e.target.value }))} />
            <div className="grid md:grid-cols-2 gap-3">
              <Input required placeholder="Логин" value={doctorForm.login} onChange={e => setDoctorForm(prev => ({ ...prev, login: e.target.value }))} />
              <Input required placeholder="Пароль" value={doctorForm.password} onChange={e => setDoctorForm(prev => ({ ...prev, password: e.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Телефон" value={doctorForm.phone} onChange={e => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))} />
              <Input type="email" placeholder="Email" value={doctorForm.email} onChange={e => setDoctorForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <Input required placeholder="Специальность" value={doctorForm.specialty} onChange={e => setDoctorForm(prev => ({ ...prev, specialty: e.target.value }))} />
            <Input required placeholder="Образование" value={doctorForm.education} onChange={e => setDoctorForm(prev => ({ ...prev, education: e.target.value }))} />
            <div className="grid md:grid-cols-[1fr_120px] gap-3">
              <Input placeholder="/images/doc13.webp или https://..." value={doctorForm.photo} onChange={e => setDoctorForm(prev => ({ ...prev, photo: e.target.value }))} />
              <Input type="number" min="0" max="5" step="0.1" placeholder="Рейтинг" value={doctorForm.rating} onChange={e => setDoctorForm(prev => ({ ...prev, rating: e.target.value }))} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900 mb-2">Клиники врача</p>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {organizations.map(org => (
                  <label key={org.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={doctorForm.organizationIds.includes(org.id)}
                      onChange={() => toggleDoctorOrganization(org.id)}
                    />
                    <span>
                      <span className="font-medium text-gray-900">{org.name}</span>
                      <span className="block text-xs text-gray-500">{org.address}</span>
                    </span>
                  </label>
                ))}
                {organizations.length === 0 && <p className="text-sm text-gray-500">Сначала добавьте клинику</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting === 'doctor' || organizations.length === 0}>
              <Plus size={16} className="mr-2" /> {submitting === 'doctor' ? 'Сохраняем...' : 'Добавить врача'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Существующие врачи</h2>
            <p className="text-sm text-gray-500">Список аккаунтов врачей с привязками к клиникам</p>
          </div>
          <div className="divide-y divide-gray-100">
            {doctorUsers.map(doctor => {
              const profile = doctors.find(item => item.userId === doctor.id);
              const clinicNames = profile?.organizations
                .map(id => organizations.find(org => org.id === id)?.name)
                .filter(Boolean)
                .join(', ');
              const appointmentsCount = appointments.filter(appointment => appointment.doctorId === doctor.id).length;
              const fullName = `${doctor.lastName} ${doctor.firstName}`;

              return (
                <div key={doctor.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{fullName} {doctor.patronymic}</p>
                      <span className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700">{profile?.specialty}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{clinicNames || 'Клиника не выбрана'}</p>
                    <p className="text-xs text-gray-400 mt-1">Логин {doctor.login} · рейтинг {profile?.rating ?? '—'} · записей {appointmentsCount}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 lg:w-auto"
                    disabled={busyId === doctor.id}
                    onClick={() => handleDeleteDoctor(doctor.id, fullName)}
                  >
                    <Trash2 size={16} className="mr-2" /> Удалить
                  </Button>
                </div>
              );
            })}
            {doctorUsers.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-500">Врачей пока нет</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Админ-панель</h1>
              <p className="text-xs text-gray-500">Оперативное управление MedConnect</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw size={16} className="mr-2" /> Обновить
            </Button>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Выйти">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-6 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <Card key={stat.label} className="border-gray-100 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.tone}`}>
                  <stat.icon size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  clearMessages();
                  setActiveSection(section.id);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Icon size={18} />
                {section.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{section.count}</span>
              </button>
            );
          })}
        </section>

        {(notice || formError) && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${formError ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
            {formError || notice}
          </div>
        )}

        {activeSection === 'appointments' && renderAppointments()}
        {activeSection === 'clinics' && renderClinics()}
        {activeSection === 'doctors' && renderDoctors()}
      </main>
    </div>
  );
}
