# MedConnect

React + FastAPI приложение для записи пациентов к врачам и ведения приема.

## Быстрый запуск через Docker

Нужен только Docker Desktop.

```bash
docker compose up --build
```

Если видите ошибку вида `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, это не про картинку. Docker image - это образ контейнера. Такая ошибка значит, что Docker Desktop не запущен или Linux Engine еще не поднялся. Откройте Docker Desktop, дождитесь статуса `Engine running`, затем повторите команду.

После запуска:

- frontend: `http://localhost:3000`
- backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/api/docs`

Docker поднимает два сервиса:

- `frontend` - собранный React, который отдает Nginx.
- `backend` - FastAPI + SQLite.

Nginx внутри frontend-контейнера проксирует `/api` в backend-контейнер, поэтому в браузере все работает с одного адреса `http://localhost:3000`.

База хранится в Docker volume `medconnect-db`, поэтому данные не пропадают после перезапуска контейнеров.

Остановить:

```bash
docker compose down
```

Остановить и удалить базу:

```bash
docker compose down -v
```

## Демо-аккаунты

Пароль у всех демо-пользователей: `123`.

- Администратор: `admin`
- Пациенты: `patient1`, `patient2`, `patient3`, `patient4`, `patient5`, `patient6`, `patient7`, `patient8`, `patient9`, `patient10`
- Врачи: `doctor1`, `doctor2`, `doctor3`, `doctor4`, `doctor5`, `doctor6`, `doctor7`, `doctor8`, `doctor9`, `doctor10`, `doctor11`, `doctor12`

Если база уже была создана до расширения демо-данных, backend мягко дозаполнит недостающих пользователей при старте. Для полностью чистой демо-базы можно пересоздать volume:

```bash
docker compose down -v
docker compose up --build
```

## Куда добавлять картинки

Fallback уже встроен: если файл врача или клиники не найден, приложение сначала попробует локальный fallback, а потом покажет встроенную SVG-заглушку.

Локальные fallback-файлы кладите сюда:

- `public/images/clinic-placeholder.svg`
- `public/images/doctor-placeholder.svg`

Если хотите использовать свои реальные фото в демо-данных, добавьте файлы в `public/images/`, например:

- `public/images/clinic-1.webp`
- `public/images/doctor-1.webp`

Потом поменяйте пути в `fastapi_backend/seed.py` в полях `photo_url`, например:

```python
photo_url="/images/doctor-1.webp"
```

После изменения сидов пересоздайте volume базы:

```bash
docker compose down -v
docker compose up --build
```

## Локальный запуск без Docker

Backend:

```bash
cd fastapi_backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
python -m uvicorn fastapi_backend.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
npm install
npm run dev
```

Откройте `http://localhost:3000`. Vite проксирует `/api` на FastAPI.

## Пересобрать после изменений

```bash
docker compose up --build
```
