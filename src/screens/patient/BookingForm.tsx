import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, format, parseISO, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, CheckCircle2, ChevronLeft, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '11:00', '12:30', '14:00', '15:30', '16:00', '17:00'];

export default function BookingForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { users, doctors, organizations, currentUser, addAppointment } = useAppContext();

  const doctorUser = users.find(u => u.id === id);
  const doctorProfile = doctors.find(d => d.userId === id);
  const availableDates = useMemo(() => Array.from({ length: 10 }).map((_, i) => addDays(startOfToday(), i)), []);

  const initialOrg = searchParams.get('org') || doctorProfile?.organizations[0] || '';
  const initialDate = searchParams.get('date') || format(availableDates[1] || startOfToday(), 'yyyy-MM-dd');
  const initialTime = searchParams.get('time') || TIME_SLOTS[2];

  const [selectedOrgId, setSelectedOrgId] = useState(initialOrg);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [reason, setReason] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<{ room: string; date: string; time: string } | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOrg = organizations.find(o => o.id === selectedOrgId);
  const doctorOrganizations = doctorProfile?.organizations
    .map(orgId => organizations.find(o => o.id === orgId))
    .filter(Boolean) || [];

  if (!doctorUser || !doctorProfile || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Не удалось открыть запись</h1>
            <p className="text-sm text-gray-500">Проверьте выбранного врача или вернитесь к поиску.</p>
            <Button className="w-full" onClick={() => navigate('/patient/search')}>
              Перейти к поиску
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const apptDate = parseISO(selectedDate);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedOrg) {
      setError('Выберите клинику');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = await addAppointment({
        doctorId: doctorUser.id,
        orgId: selectedOrg.id,
        date: selectedDate,
        time: selectedTime,
        reason,
      });
      setConfirmedAppointment({ room: appointment.room, date: appointment.date, time: appointment.time });
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : 'Не удалось создать запись');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedAppointment) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8 border-green-100 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={42} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Запись подтверждена</h2>
            <p className="text-gray-600">Информация о приеме сохранена в вашем профиле.</p>

            <div className="bg-gray-50 p-4 rounded-xl w-full text-left space-y-3 mt-4 border border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 text-sm">Дата и время</span>
                <span className="font-semibold text-gray-900">{format(parseISO(confirmedAppointment.date), 'd MMMM', { locale: ru })}, {confirmedAppointment.time}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 text-sm">Кабинет</span>
                <span className="font-bold text-blue-600 text-lg">{confirmedAppointment.room}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Врач</span>
                <span className="font-medium text-gray-900 text-right">{doctorUser.lastName} {doctorUser.firstName[0]}. {doctorUser.patronymic?.[0]}.</span>
              </div>
            </div>

            <Button className="w-full mt-6 h-12" onClick={() => navigate('/patient/home')}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-200 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Запись на прием</h1>
          <p className="text-sm text-gray-500">{doctorProfile.specialty}</p>
        </div>
      </header>

      <form onSubmit={handleConfirm} className="p-4 space-y-6 max-w-3xl mx-auto">
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-0 divide-y divide-gray-100">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-0.5">Врач</p>
                <p className="font-semibold text-gray-900">{doctorUser.lastName} {doctorUser.firstName} {doctorUser.patronymic}</p>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={16} /> Клиника
              </p>
              <div className="grid gap-3">
                {doctorOrganizations.map(org => org && (
                  <label key={org.id} className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedOrgId === org.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                    <input type="radio" name="organization" value={org.id} checked={selectedOrgId === org.id} onChange={() => setSelectedOrgId(org.id)} className="sr-only" />
                    <span className="block font-semibold text-gray-900">{org.name}</span>
                    <span className="block text-sm text-gray-500 mt-1">{org.address}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-3 flex items-center gap-2">
                <Calendar size={16} /> Дата
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableDates.map(date => {
                  const value = format(date, 'yyyy-MM-dd');
                  const isSelected = value === selectedDate;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedDate(value)}
                      className={`min-w-[76px] p-3 rounded-xl border text-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                    >
                      <span className="block text-xs opacity-80">{format(date, 'EEEEEE', { locale: ru })}</span>
                      <span className="block text-lg font-bold">{format(date, 'd')}</span>
                      <span className="block text-[10px] uppercase opacity-80">{format(date, 'MMM', { locale: ru })}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-3 flex items-center gap-2">
                <Clock size={16} /> Время
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`h-10 rounded-lg border text-sm font-medium transition-colors ${selectedTime === time ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Причина визита <span className="text-gray-400 font-normal">(необязательно)</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
              placeholder="Опишите симптомы или причину обращения..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 md:static md:border-none md:p-0 md:bg-transparent">
          <div className="max-w-3xl mx-auto">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <Button type="submit" className="w-full h-12 text-lg font-medium shadow-lg md:shadow-none" disabled={isSubmitting}>
              {isSubmitting ? 'Записываем...' : `Подтвердить: ${format(apptDate, 'd MMM', { locale: ru })}, ${selectedTime}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
