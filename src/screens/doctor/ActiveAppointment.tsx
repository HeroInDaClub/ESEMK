import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, History, FileText, Stethoscope, Pill, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';

export default function ActiveAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, users, medicalRecords, updateAppointment } = useAppContext();

  const appt = appointments.find(a => a.id === id);
  const patient = users.find(u => u.id === appt?.patientId);
  const medRecord = medicalRecords.find(m => m.patientId === appt?.patientId);

  const [complaints, setComplaints] = useState(appt?.reason || '');
  const [diagnosis, setDiagnosis] = useState(appt?.diagnosis || '');
  const [treatment, setTreatment] = useState(appt?.treatmentPlan || '');
  const [comments, setComments] = useState(appt?.comments || '');

  useEffect(() => {
    if (appt && appt.status === 'waiting') {
      void updateAppointment(appt.id, { status: 'accepted' });
    }
  }, [appt, updateAppointment]);

  if (!appt || !patient) return <div className="p-4">Прием не найден</div>;

  const handleFinish = async () => {
    await updateAppointment(appt.id, {
      status: 'completed',
      reason: complaints,
      diagnosis,
      treatmentPlan: treatment,
      comments
    });
    navigate('/doctor/dashboard');
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button onClick={() => navigate('/doctor/dashboard')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Текущий прием</h1>
          <p className="text-sm text-blue-600 font-medium">{appt.time}</p>
        </div>
      </header>

      {/* Patient Info */}
      <Card className="border-blue-100 shadow-sm overflow-hidden">
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
              {patient.lastName[0]}{patient.firstName[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {patient.lastName} {patient.firstName} {patient.patronymic}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1"><Phone size={14} /> {patient.phone || '—'}</span>
                <span className="flex items-center gap-1"><Mail size={14} /> {patient.email || '—'}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="shrink-0 bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => navigate(`/doctor/patient/${patient.id}/history`)}
          >
            <History size={16} className="mr-2" />
            История посещений
          </Button>
        </div>
        
        {/* Medical Record Summary */}
        <CardContent className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                Хронические заболевания
              </h3>
              <p className="text-sm text-red-900">{medRecord?.chronicDiseases || 'Нет данных'}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <h3 className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                Аллергии
              </h3>
              <p className="text-sm text-yellow-900">{medRecord?.allergies || 'Нет данных'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                Важные пометки
              </h3>
              <p className="text-sm text-gray-800">{medRecord?.importantNotes || 'Нет данных'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <FileText size={18} className="text-blue-600" />
              Жалобы пациента
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
              placeholder="Опишите жалобы со слов пациента..."
              value={complaints}
              onChange={e => setComplaints(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <Stethoscope size={18} className="text-red-500" />
              Диагноз
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y font-medium"
              placeholder="Установите диагноз..."
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <Pill size={18} className="text-green-600" />
              План лечения / Назначения
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              placeholder="Опишите план лечения, назначенные препараты и процедуры..."
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
              <MessageSquare size={18} className="text-yellow-600" />
              Рекомендации / Комментарий
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
              placeholder="Дополнительные рекомендации для пациента..."
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:static md:border-none md:shadow-none md:p-0 md:bg-transparent">
        <div className="max-w-7xl mx-auto flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-12 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              if (window.confirm('Пациент не пришел?')) {
                void updateAppointment(appt.id, { status: 'no_show' }).then(() => navigate('/doctor/dashboard'));
              }
            }}
          >
            Не пришел
          </Button>
          <Button 
            className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-lg font-medium"
            onClick={handleFinish}
          >
            Завершить прием
          </Button>
        </div>
      </div>
    </div>
  );
}
