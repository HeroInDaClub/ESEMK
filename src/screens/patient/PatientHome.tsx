import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Baby, Bone, Brain, Dumbbell, Eye, HeartPulse, MapPin, Star, Stethoscope } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { handleImageError, imageSrc } from '../../lib/imageFallback';

const DIRECTIONS = [
  { name: 'Терапевт', icon: HeartPulse, tone: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Невролог', icon: Brain, tone: 'bg-violet-50 text-violet-600 border-violet-100' },
  { name: 'Офтальмолог', icon: Eye, tone: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Травматолог', icon: Bone, tone: 'bg-rose-50 text-rose-600 border-rose-100' },
  { name: 'Педиатр', icon: Baby, tone: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { name: 'Эндокринолог', icon: Activity, tone: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { name: 'Реабилитолог', icon: Dumbbell, tone: 'bg-lime-50 text-lime-700 border-lime-100' },
];

export default function PatientHome() {
  const navigate = useNavigate();
  const { currentUser, appointments, users, organizations, doctors, updateAppointment } = useAppContext();

  const activeAppointments = useMemo(() => {
    return appointments
      .filter(a => a.patientId === currentUser?.id && (a.status === 'waiting' || a.status === 'accepted'))
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
  }, [appointments, currentUser?.id]);

  const nearestAppt = activeAppointments[0];

  const featuredDoctors = useMemo(() => {
    return doctors
      .map(doc => {
        const user = users.find(u => u.id === doc.userId);
        const org = organizations.find(o => o.id === doc.organizations[0]);
        return user ? { ...doc, user, org } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.rating || 0) - (a?.rating || 0))
      .slice(0, 4);
  }, [doctors, users, organizations]);

  const topOrganizations = useMemo(() => {
    return [...organizations].sort((a, b) => b.rating - a.rating).slice(0, 6);
  }, [organizations]);

  const handleCancelAppt = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите отменить запись?')) {
      await updateAppointment(id, { status: 'cancelled' });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="p-4 space-y-8">
        <header className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 overflow-hidden relative">
          <div className="absolute right-4 top-4 hidden sm:flex h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 items-center justify-center">
            <Stethoscope size={28} />
          </div>
          <p className="text-sm text-blue-600 font-semibold mb-1">MedConnect</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Здравствуйте, {currentUser?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xl">Найдите врача, выберите удобную клинику и запишитесь на прием за пару шагов.</p>
        </header>

        {nearestAppt && (() => {
          const docUser = users.find(u => u.id === nearestAppt.doctorId);
          const docProfile = doctors.find(d => d.userId === nearestAppt.doctorId);
          const org = organizations.find(o => o.id === nearestAppt.orgId);
          const apptDate = parseISO(nearestAppt.date);

          return (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Ближайшая запись</h2>
                <button onClick={() => navigate('/patient/profile')} className="text-sm text-blue-600 hover:underline">Все записи</button>
              </div>
              <Card className="bg-blue-50 border-blue-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{docUser?.lastName} {docUser?.firstName} {docUser?.patronymic}</p>
                      <p className="text-blue-600 text-sm font-medium">{docProfile?.specialty}</p>
                      <div className="flex items-start gap-2 text-gray-600 text-sm mt-3">
                        <MapPin size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{org?.name}</p>
                          <p>{org?.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-stretch gap-2">
                      <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-center min-w-[112px]">
                        <p className="text-sm font-bold text-gray-900">{format(apptDate, 'd MMM', { locale: ru })}</p>
                        <p className="text-sm text-gray-600">{nearestAppt.time}</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleCancelAppt(nearestAppt.id)}>
                        Отменить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          );
        })()}

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Быстрый выбор направления</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {DIRECTIONS.map(direction => (
              <button
                key={direction.name}
                onClick={() => navigate(`/patient/search?q=${encodeURIComponent(direction.name)}&cat=doctor`)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left hover:shadow-sm transition-all ${direction.tone}`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                  <direction.icon size={22} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{direction.name}</p>
                  <p className="text-xs opacity-80">Показать врачей</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Рекомендуемые врачи</h2>
              <p className="text-sm text-gray-500">Можно открыть профиль или сразу выбрать время</p>
            </div>
            <button onClick={() => navigate('/patient/search?cat=doctor')} className="text-sm text-blue-600 hover:underline">Все врачи</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {featuredDoctors.map(doc => doc && (
              <Card key={doc.userId} className="overflow-hidden border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img src={imageSrc(doc.photo, 'doctor')} alt={doc.user.lastName} className="w-20 h-20 rounded-2xl object-cover shrink-0" referrerPolicy="no-referrer" onError={handleImageError('doctor')} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate">{doc.user.lastName} {doc.user.firstName} {doc.user.patronymic}</h3>
                      <p className="text-blue-600 text-sm font-medium">{doc.specialty}</p>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium text-gray-700">{doc.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 truncate">{doc.org?.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button variant="outline" onClick={() => navigate(`/patient/doctor/${doc.userId}`)}>Профиль</Button>
                    <Button onClick={() => navigate(`/patient/book/${doc.userId}`)}>Записаться</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Клиники рядом</h2>
              <p className="text-sm text-gray-500">Откройте список врачей выбранной клиники</p>
            </div>
            <button onClick={() => navigate('/patient/search?cat=org')} className="text-sm text-blue-600 hover:underline">Все клиники</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topOrganizations.map(org => (
              <Card key={org.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-gray-100" onClick={() => navigate(`/patient/search?q=${encodeURIComponent(org.name)}&cat=org`)}>
                <img src={imageSrc(org.photo, 'clinic')} alt={org.name} className="w-full h-32 object-cover" referrerPolicy="no-referrer" onError={handleImageError('clinic')} />
                <CardContent className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500 text-sm my-1">
                    <Star size={14} fill="currentColor" />
                    <span className="font-medium text-gray-700">{org.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{org.address}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
