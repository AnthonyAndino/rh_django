# RH

Proyecto de Recursos Humanos organizado como monorepo:

- `backend/`: API REST con Django, Django REST Framework y MySQL.
- `frontend/`: aplicacion React/Vite que consume la API del backend.

## Estructura

```text
RH/
  backend/
    manage.py
    requirements.txt
    empleados/
    rh_django/
  frontend/
    package.json
    src/
    public/
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

Por defecto el backend espera MySQL en `127.0.0.1:3306` con la base `recursos_humanos_db`.
Puedes cambiar esos valores en `backend/.env`.

### Endpoints

| Metodo | Endpoint | Descripcion |
| --- | --- | --- |
| GET | `/api/empleados` | Lista empleados |
| POST | `/api/empleados` | Crea empleado |
| GET | `/api/empleados/<id>` | Obtiene empleado |
| PUT/PATCH | `/api/empleados/<id>` | Actualiza empleado |
| DELETE | `/api/empleados/<id>` | Elimina empleado |

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

El frontend apunta por defecto a `http://localhost:8000/api/empleados`.
Puedes cambiarlo en `frontend/.env` con `VITE_API_BASE_URL`.

### Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notas de repositorio

No se suben carpetas generadas como `node_modules/`, `dist/`, `__pycache__/`, entornos virtuales ni archivos `.env` locales.

