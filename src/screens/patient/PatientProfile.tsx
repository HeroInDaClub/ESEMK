import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, FileText, Calendar, Edit2, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function PatientProfile() {
  const navigate = useNavigate();
  const {
    currentUser,
    logout,
    appointments,
    users,
    organizations,
    doctors,
    medicalRecords,
    updateAppointment,
    updateCurrentUser,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'visits' | 'medical'>('visits');
  const [visitFilter, setVisitFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    patronymic: currentUser?.patronymic || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    await updateCurrentUser(profileData);
    setIsEditing(false);
  };

  const myAppointments = appointments.filter(a => a.patientId === currentUser.id);
  const upcomingVisits = myAppointments.filter(a => a.status === 'waiting' || a.status === 'accepted');
  const pastVisits = myAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled' || a.status === 'no_show');

  const myMedicalRecord = medicalRecords.find(m => m.patientId === currentUser.id);
  const medicalSummaryItems = [
    { label: 'Группа крови', value: myMedicalRecord?.bloodType || 'Нет данных', tone: 'bg-blue-500' },
    { label: 'Давление', value: myMedicalRecord?.bloodPressure || 'Нет данных', tone: 'bg-red-500' },
    {
      label: 'Рост / вес',
      value: [
        myMedicalRecord?.heightCm ? `${myMedicalRecord.heightCm} см` : null,
        myMedicalRecord?.weightKg ? `${myMedicalRecord.weightKg} кг` : null,
      ].filter(Boolean).join(' / ') || 'Нет данных',
      tone: 'bg-cyan-500',
    },
    { label: 'Вакцинация', value: myMedicalRecord?.immunizations || 'Нет данных', tone: 'bg-emerald-500' },
    { label: 'Образ жизни', value: myMedicalRecord?.lifestyle || 'Нет данных', tone: 'bg-lime-500' },
    { label: 'Ограничения', value: myMedicalRecord?.restrictions || 'Нет данных', tone: 'bg-violet-500' },
    { label: 'Факторы риска', value: myMedicalRecord?.riskFactors || 'Нет данных', tone: 'bg-orange-500' },
    { label: 'Экстренный контакт', value: myMedicalRecord?.emergencyContact || 'Нет данных', tone: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-6 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100">
          <LogOut size={20} />
        </button>
      </header>

      <div className="p-4 space-y-6 md:flex md:gap-8 md:space-y-0">
        {/* Profile Info */}
        <div className="md:w-1/3 md:shrink-0 space-y-6">
          <Card className="overflow-hidden border-none shadow-sm">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {currentUser.lastName[0]}{currentUser.firstName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold leading-tight">{currentUser.lastName} {currentUser.firstName}</h2>
                <p className="text-blue-100 text-sm mt-1 opacity-90">{currentUser.login}</p>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isEditing ? <Check size={20} /> : <Edit2 size={20} />}
              </button>
            </div>
            
            <div className="p-4 space-y-4 bg-white">
              {isEditing ? (
                <div className="space-y-3">
                  <Input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} placeholder="Фамилия" />
                  <Input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} placeholder="Имя" />
                  <Input value={profileData.patronymic} onChange={e => setProfileData({...profileData, patronymic: e.target.value})} placeholder="Отчество" />
                  <Input value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} placeholder="Телефон" />
                  <Input value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} placeholder="Email" />
                  <Button onClick={handleSaveProfile} className="w-full mt-2">Сохранить</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Телефон</p>
                    <p className="font-medium text-gray-900">{currentUser.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 truncate">{currentUser.email || '—'}</p>
                  </div>
                </div>
              )}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:flex-1 space-y-6">
          {/* Tabs */}
          <div className="flex bg-gray-200/50 p-1 rounded-xl">
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'visits' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('visits')}
            >
              Мои визиты
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'medical' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('medical')}
            >
              Медкарта
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'visits' && (
            <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${visitFilter === 'upcoming' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                onClick={() => setVisitFilter('upcoming')}
              >
                Предстоящие ({upcomingVisits.length})
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${visitFilter === 'past' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                onClick={() => setVisitFilter('past')}
              >
                Прошедшие ({pastVisits.length})
              </button>
            </div>
            
            <div className="space-y-3">
              {(visitFilter === 'upcoming' ? upcomingVisits : pastVisits).map(visit => {
                  const docUser = users.find(u => u.id === visit.doctorId);
                  const docProfile = doctors.find(d => d.userId === visit.doctorId);
                  const org = organizations.find(o => o.id === visit.orgId);
                  const isUpcoming = visitFilter === 'upcoming';

                  return (
                    <Card key={visit.id} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-4 flex gap-4">
                          <div className="w-16 h-16 bg-blue-50 rounded-xl flex flex-col items-center justify-center shrink-0 text-blue-600 border border-blue-100">
                            <span className="text-xs font-medium uppercase">{format(parseISO(visit.date), 'MMM', { locale: ru })}</span>
                            <span className="text-xl font-bold leading-none my-0.5">{format(parseISO(visit.date), 'dd')}</span>
                            <span className="text-[10px] font-medium">{visit.time}</span>
                          </div>
                          <div className="flex-1 min-w-0 py-0.5">
                            <h3 className="font-semibold text-gray-900 truncate">{docUser?.lastName} {docUser?.firstName[0]}. {docUser?.patronymic?.[0]}.</h3>
                            <p className="text-blue-600 text-xs font-medium mb-1.5">{docProfile?.specialty}</p>
                            <p className="text-gray-500 text-xs truncate">{org?.name}</p>
                            {visit.room && <p className="text-gray-500 text-xs mt-0.5">Кабинет: <span className="font-medium text-gray-900">{visit.room}</span></p>}
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end">
                          {isUpcoming ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => updateAppointment(visit.id, { status: 'cancelled' })}
                            >
                              Отменить запись
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => navigate(`/patient/visit/${visit.id}`)}
                            >
                              Подробнее
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {(visitFilter === 'upcoming' ? upcomingVisits : pastVisits).length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                  <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Нет {visitFilter === 'upcoming' ? 'предстоящих' : 'прошедших'} визитов</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-4">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Расширенная медкарта</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {medicalSummaryItems.map(item => (
                    <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${item.tone}`}></div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Хронические заболевания
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                    {myMedicalRecord?.chronicDiseases || 'Нет данных'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Аллергии
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                    {myMedicalRecord?.allergies || 'Нет данных'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Важные пометки
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                    {myMedicalRecord?.importantNotes || 'Нет данных'}
                  </p>
                </div>
              </CardContent>
            </Card>

              <h2 className="text-lg font-bold text-gray-900 mt-6 mb-3 px-1">История приемов</h2>
              <div className="space-y-3">
                {pastVisits.map(visit => {
                  const docUser = users.find(u => u.id === visit.doctorId);
                  const docProfile = doctors.find(d => d.userId === visit.doctorId);
                  
                  return (
                    <button 
                      key={visit.id}
                      onClick={() => navigate(`/patient/visit/${visit.id}`)}
                      className="w-full text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 mb-0.5">{format(parseISO(visit.date), 'd MMMM yyyy', { locale: ru })}</p>
                        <p className="text-sm text-gray-500">{docProfile?.specialty} • {docUser?.lastName} {docUser?.firstName[0]}.</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <FileText size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
