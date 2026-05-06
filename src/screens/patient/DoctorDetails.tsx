import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';
import { handleImageError, imageSrc } from '../../lib/imageFallback';
import { format, addDays, startOfToday } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, doctors, organizations } = useAppContext();

  const doctorProfile = doctors.find(d => d.userId === id);
  const doctorUser = users.find(u => u.id === id);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(doctorProfile?.organizations[0] || null);

  if (!doctorProfile || !doctorUser) return <div className="p-4">Врач не найден</div>;

  const docOrgs = doctorProfile.organizations.map(orgId => organizations.find(o => o.id === orgId)!);

  const today = startOfToday();
  const availableDates = Array.from({ length: 10 }).map((_, i) => addDays(today, i));
  const timeSlots = ['09:00', '09:30', '10:00', '11:00', '12:30', '14:00', '15:30', '16:00', '17:00'];

  const handleBook = () => {
    if (selectedDate && selectedTime && selectedOrg) {
      navigate(`/patient/book/${id}?date=${format(selectedDate, 'yyyy-MM-dd')}&time=${selectedTime}&org=${selectedOrg}`);
    }
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header Image & Back Button */}
      <div className="relative h-64 bg-gray-200">
        <img src={imageSrc(doctorProfile.photo, 'doctor')} alt={doctorUser.lastName} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={handleImageError('doctor')} />
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
          <h1 className="text-2xl font-bold text-white">
            {doctorUser.lastName} {doctorUser.firstName} {doctorUser.patronymic}
          </h1>
          <p className="text-blue-200 font-medium">{doctorProfile.specialty}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-4 relative z-10 max-w-5xl mx-auto">
        {/* Info Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex justify-around divide-x divide-gray-100">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                <Star size={18} fill="currentColor" />
                <span className="font-bold text-lg text-gray-900">{doctorProfile.rating}</span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Рейтинг</p>
            </div>
            <div className="flex-1 text-center">
              <p className="font-bold text-lg text-gray-900 mb-1">10+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Лет стажа</p>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Образование</h2>
          <p className="text-gray-700 bg-white p-4 rounded-xl border border-gray-100">{doctorProfile.education}</p>
        </section>

        {/* Clinics */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Места приема</h2>
          <div className="space-y-3">
            {docOrgs.map(org => (
              <label 
                key={org.id} 
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedOrg === org.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <input 
                  type="radio" 
                  name="org" 
                  value={org.id} 
                  checked={selectedOrg === org.id} 
                  onChange={() => setSelectedOrg(org.id)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{org.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-start gap-1">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    {org.address}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Расписание и запись</h2>
          
          {/* Dates */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {availableDates.map((date, i) => {
              const isSelected = selectedDate?.getTime() === date.getTime();
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`min-w-[72px] p-3 rounded-2xl flex flex-col items-center justify-center border transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <span className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                    {format(date, 'EEEEEE', { locale: ru })}
                  </span>
                  <span className="text-lg font-bold">{format(date, 'd')}</span>
                  <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                    {format(date, 'MMM', { locale: ru })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Times */}
          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} /> Доступное время
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-1 rounded-lg text-sm font-medium border transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Reviews */}
        {selectedOrg && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Отзывы об организации</h2>
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                    А
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">Анонимный пациент</p>
                    <div className="flex text-yellow-500">
                      {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"Отличная клиника, вежливый персонал и современное оборудование. Врач очень внимательный."</p>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 max-w-5xl mx-auto">
        <Button 
          className="w-full h-12 text-lg font-medium shadow-lg"
          disabled={!selectedDate || !selectedTime || !selectedOrg}
          onClick={handleBook}
        >
          Записаться на прием
        </Button>
      </div>
    </div>
  );
}
