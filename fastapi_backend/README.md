# MedConnect FastAPI Backend

FastAPI backend для React-приложения MedConnect.

## Возможности

- Авторизация пациента и врача через bearer token.
- Хеширование паролей через PBKDF2-HMAC-SHA256.
- Каталог врачей, клиник, медкарт и записей.
- Создание и отмена записей пациентом.
- Проведение приема врачом: статус, диагноз, план лечения, рекомендации.
- Автосидирование демо-данных при первом запуске пустой базы.
- Production-режим: отдача собранного React из `../dist`.

## Запуск

```bash
pip install -r requirements.txt
cd ..
python -m uvicorn fastapi_backend.main:app --reload --host 0.0.0.0 --port 8000
```

Документация API: `http://127.0.0.1:8000/api/docs`.

## Переменные окружения

- `DATABASE_URL` - строка подключения SQLAlchemy. По умолчанию используется `fastapi_backend/medconnect.db`.
- `SECRET_KEY` - секрет подписи access token. В production обязательно заменить.
- `ACCESS_TOKEN_EXPIRE_MINUTES` - время жизни токена.
- `ALLOWED_ORIGINS` - список CORS origins через запятую.
