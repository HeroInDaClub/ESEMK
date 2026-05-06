import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldCheck, Stethoscope, User } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      <Card className="w-full max-w-lg border-gray-100 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">M</div>
          <CardTitle className="text-3xl">MedConnect</CardTitle>
          <p className="text-gray-500 text-sm mt-2">Выберите рабочую область</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button 
            className="h-16 text-lg flex gap-3 justify-start px-6" 
            onClick={() => navigate('/patient/login')}
          >
            <User size={24} />
            Пациент
          </Button>
          <Button 
            variant="outline" 
            className="h-16 text-lg flex gap-3 justify-start px-6"
            onClick={() => navigate('/doctor/login')}
          >
            <Stethoscope size={24} />
            Врач
          </Button>
          <Button
            variant="outline"
            className="h-16 text-lg flex gap-3 justify-start px-6 border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => navigate('/admin/login')}
          >
            <ShieldCheck size={24} />
            Администратор
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
