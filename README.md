# Glamora

Full-stack salon management and appointment booking platform. It has a Django REST API secured with JWT and a React/Vite client with user and salon-owner experiences.

## Quick start

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py makemigrations salon
python manage.py migrate
python manage.py runserver
```

Set `DATABASE_ENGINE=django.db.backends.mysql` and your MySQL variables in `.env` for MySQL. The supplied development default is SQLite so the project starts immediately.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The client expects the API on `http://127.0.0.1:8000/api` (override with `VITE_API_URL`).
