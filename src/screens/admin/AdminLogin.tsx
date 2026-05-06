import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAppContext } from '../../AppContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn } = useAppContext();
  const [loginStr, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn('admin', loginStr, password);
      navigate('/admin');
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md border-blue-100 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <CardTitle className="text-2xl">Администрирование</CardTitle>
          <p className="text-sm text-gray-500 mt-2">Управление расписанием, пациентами и приемами</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
              <Input value={loginStr} onChange={e => setLoginStr(e.target.value)} placeholder="Введите логин" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
            <Link to="/" className="text-center text-sm text-blue-600 hover:underline">
              Вернуться к выбору роли
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
