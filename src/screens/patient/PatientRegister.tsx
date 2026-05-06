import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../AppContext';

export default function PatientRegister() {
  const navigate = useNavigate();
  const { registerUser } = useAppContext();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', patronymic: '',
    login: '', password: '', confirmPassword: '',
    email: '', phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        login: formData.login.trim(),
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        patronymic: formData.patronymic,
        email: formData.email,
        phone: formData.phone,
      });
      setSuccess('Аккаунт создан. Сейчас перенаправим вас на вход.');
      window.setTimeout(() => navigate('/patient/login'), 900);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Не удалось зарегистрироваться');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Регистрация</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input name="firstName" placeholder="Имя" required onChange={handleChange} />
            <Input name="lastName" placeholder="Фамилия" required onChange={handleChange} />
            <Input name="patronymic" placeholder="Отчество (необязательно)" onChange={handleChange} />
            <Input name="login" placeholder="Логин" required onChange={handleChange} />
            <Input name="password" type="password" placeholder="Пароль" required onChange={handleChange} />
            <Input name="confirmPassword" type="password" placeholder="Подтверждение пароля" required onChange={handleChange} />
            <Input name="email" type="email" placeholder="Электронная почта" required onChange={handleChange} />
            <Input name="phone" type="tel" placeholder="Номер телефона" required onChange={handleChange} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
            </Button>
            <div className="text-center mt-4">
              <Link to="/patient/login" className="text-blue-600 text-sm hover:underline">
                Уже есть аккаунт? Войти
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
