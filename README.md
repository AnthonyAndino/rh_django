# RH Manager

Sistema de gestion de Recursos Humanos con autenticacion por roles, modulo de asistencia, nominas y dashboard.

- `backend/`: API REST con Django, Django REST Framework y MySQL.
- `frontend/`: aplicacion React/Vite con diseño minimalista "Sand & Terracotta".

## Estructura

```text
rh-manager/
├── backend/
│   ├── manage.py
│   ├── empleados/
│   │   ├── models.py          # Empleado, Asistencia, Nomina, UserProfile, ConfiguracionNomina
│   │   ├── views.py           # CRUD, autenticacion, dashboard
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py  # Datos de demostracion
│   └── rh_django/
│       └── settings.py
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx            # Rutas publicas y protegidas por rol
│       ├── AuthContext.jsx     # Contexto de autenticacion
│       ├── Navegacion.jsx     # Sidebar responsive con roles
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── RecuperarPassword.jsx
│       ├── index.css          # Diseño minimalista completo
│       ├── config.js
│       └── empleados/
│           ├── Dashboard.jsx         # KPIs por rol
│           ├── ListadoEmpleados.jsx  # CRUD con filtros
│           ├── AgregarEmpleado.jsx
│           ├── EditarEmpleado.jsx
│           ├── EmpleadosForm.jsx
│           ├── ControlAsistencias.jsx # Checador con filtros
│           ├── ControlNominas.jsx    # Configuracion y calculo
│           └── empleadosApi.js
├── .env.example
├── .gitignore
└── README.md
```

## Requisitos

- Python 3.10+
- Node.js 18+
- MySQL 8+
- npm o yarn

## Backend

```bash
cd backend
pip install -r requirements.txt
copy ..\.env.example .env
```

Edita `.env` con tus credenciales de MySQL. Luego:

```bash
python manage.py migrate
python manage.py runserver
```

### Datos de demostracion

Para poblar la base de datos con datos de prueba:

```bash
python manage.py seed_data
```

Esto crea:
- **10 empleados** con nombres, puestos y departamentos realistas
- **30 dias de asistencias** con retardos aleatorios
- **3 meses de nominas** calculadas con deducciones y bonos
- **2 usuarios**:
  - Admin: `admin` / `admin123`
  - Empleado: `empleado1` / `empleado123`

### Endpoints

| Metodo | Endpoint | Descripcion | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Inicio de sesion (Token) | No |
| POST | `/api/auth/recover-password` | Recuperacion de contrasena | No |
| GET | `/api/dashboard` | KPIs del dashboard por rol | Si |
| GET | `/api/empleados` | Lista empleados | Si |
| POST | `/api/empleados` | Crea empleado (solo admin) | Si |
| GET | `/api/empleados/<id>` | Obtiene empleado | Si |
| PATCH | `/api/empleados/<id>` | Actualiza empleado (solo admin) | Si |
| DELETE | `/api/empleados/<id>` | Elimina empleado (solo admin) | Si |
| GET | `/api/asistencias` | Lista asistencias (con filtros) | Si |
| POST | `/api/asistencias` | Registra entrada | Si |
| PATCH | `/api/asistencias/<id>` | Registra salida | Si |
| GET | `/api/nominas` | Lista nominas | Si |
| POST | `/api/nominas` | Genera nomina (Stored Procedure) | Si |
| GET | `/api/configuracion-nomina` | Obtiene configuracion vigente | Si |
| POST | `/api/configuracion-nomina` | Guarda configuracion | Si |

### Roles

- **admin**: Acceso completo a empleados, asistencias y nominas.
- **empleado**: Acceso a su propio dashboard, checador de asistencia y su historial.

## Frontend

```bash
cd frontend
npm install
copy ..\.env.example .env
npm run dev
```

El frontend corre en `http://localhost:5173` por defecto. La URL de la API se configura con `VITE_API_BASE_URL` en `.env`.

### Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Produccion
npm run lint     # Linter
npm run preview  # Vista previa de produccion
```

## Funcionalidades

- **Autenticacion**: Login, registro y recuperacion de contrasena con tokens.
- **Dashboard por rol**: KPIs diferentes para admin y empleado.
- **CRUD de empleados**: Con foto de perfil, filtros por departamento y estatus.
- **Checador de asistencia**: Entrada/salida, deteccion automatica de retardos.
- **Nominas**: Configuracion de deducciones y bonos, calculo mensual.
- **Diseno responsive**: Sidebar colapsable en mobile, selects minimalistas.
- **Iconos**: Todos los iconos con lucide-react (sin emojis de texto).

## Notas de repositorio

El repositorio usa un solo `.gitignore` y un solo `.env.example` en la raiz.
No se suben carpetas generadas como `node_modules/`, `dist/`, `__pycache__/`, entornos virtuales ni archivos `.env` locales.
