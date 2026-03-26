# 🩺 ESEMK — Медицинский сервис

**ESEMK** — это современный медицинский сервис, построенный на **FastAPI** для бэкенда, **React** для фронтенда и **PostgreSQL** для хранения данных.  
Он позволяет пациентам записываться на приём, просматривать врачей и историю визитов, а врачам — управлять расписанием и пациентами. А самое главное хранить мед карты

---

## 📂 Структура проекта

```

med-service/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── crud/
│   │   ├── routers/
│   │   ├── utils/
│   │   └── db.py
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml # Docker Compose для локального запуска
└── .env               # Переменные окружения

````

---

## ⚡ Быстрый старт

### 🔹 Docker (рекомендуется)

```bash
git clone <repo-url> med-service
cd med-service
docker-compose up --build
````

* **Frontend:** [http://localhost:3000](http://localhost:3000)
* **Backend:** [http://localhost:8000](http://localhost:8000)
* **PostgreSQL:** порт 5432

### 🔹 Локально

#### Backend:

```bash
cd med-service/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend:

```bash
cd med-service/frontend
npm install
npm run dev
```

---

## 🧩 Функционал

* ✅ Регистрация и вход пациентов
* ✅ Просмотр врачей и записей на приём
* ✅ Управление расписанием врачей
* ✅ История визитов и детализация
* ✅ Поддержка PostgreSQL для надежного хранения данных
* ✅ Docker для быстрого развертывания

---

## 📦 Технологии

* **Backend:** [FastAPI](https://fastapi.tiangolo.com/)
* **Frontend:** [React 18 + Vite](https://vitejs.dev/)
* **База данных:** PostgreSQL
* **ORM:** SQLAlchemy
* **Контейнеризация:** Docker & Docker Compose

---

## ⚙️ Конфигурация

Создай файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://meduser:medpass@db:5432/meddb
```

Все переменные окружения для фронтенда и бэкенда берутся из `.env`.

---

## 📚 Полезные команды

### Backend

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Docker

```bash
docker-compose up --build
docker-compose down
```

---

## 📝 Лицензия

HITS License © 2026