<div align="center">

# RH Manager · Sistema de Gestión de Recursos Humanos

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/Django_5-092E20?logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Dashboard · Asistencia · Nóminas · Autenticación por roles · Diseño **Sand & Terracotta**

[🇬🇧 English version](./README.en.md)

</div>

![Dashboard](frontend/public/assets/readme/dashboard.png)

---

## Características

### Frontend (React + Vite)
- **Paginación optimizada** con saltos de página truncados y flechas de navegación.
- **Filtros avanzados** — Selector minimalista de empleados y selector de fechas con calendario animado, ambos construidos desde cero con Lucide React.
- **Tablas ordenables** — Click en cabeceras para ordenar por cualquier columna con indicadores visuales de dirección.
- **Autenticación fluida** — Login, registro y recuperación de contraseña con fondo dinámico de esferas animadas y glassmorphism.
- **Sidebar responsive** — Colapsable con preservación de estado en localStorage, roles de usuario y footer anclado.
- **Modo oscuro** completo con paleta de colores consistente.
- **Exportación CSV** con BOM para compatibilidad con Excel.

### Backend (Django REST Framework)
- API REST con autenticación por token (DRF TokenAuth).
- CRUD completo de empleados con carga de foto de perfil.
- Módulo de asistencia con detección automática de retardos (> 8:05 AM).
- Cálculo de nómina mensual con deducciones, bonos y almacenamiento histórico.
- Dashboard con KPIs diferenciados por rol (admin / empleado).
- Seed de datos de demostración (10 empleados, 30 días de asistencias, 3 meses de nóminas).

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Bootstrap 5, Lucide React |
| **Componentes** | `ThSortable`, `Pagination`, `ScrollableTable`, `MinimalSelect`, `MinimalDatePicker` |
| **Gráficos** | Recharts |
| **Backend** | Django 5, Django REST Framework, MySQL 8 |
| **Formato** | `react-number-format` |

---

## Instalación Rápida

### Requisitos
- Python 3.10+
- Node.js 18+
- MySQL 8+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # Edita con tus credenciales MySQL
python manage.py migrate
python manage.py seed_data   # Datos de demostración
python manage.py runserver
```

Usuarios de demostración:
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |
| `empleado1` | `empleado123` | Empleado |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Scripts disponibles

```bash
npm run dev       # Desarrollo con HMR
npm run build     # Producción
npm run preview   # Vista previa de build
```

---

## Estructura del Proyecto

```
rh-manager/
├── backend/
│   ├── empleados/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── management/commands/seed_data.py
│   └── rh_django/settings.py
├── frontend/
│   ├── src/
│   │   ├── components/          # ThSortable, Pagination, MinimalSelect, DatePicker, ScrollableTable
│   │   ├── empleados/           # Dashboard, ListadoEmpleados, ControlAsistencias, ControlNominas
│   │   ├── AuthContext.jsx      # Autenticación con tokens
│   │   ├── Navegacion.jsx       # Sidebar responsive
│   │   └── index.css            # Sistema de diseño Sand & Terracotta completo
│   └── public/assets/readme/    # Capturas para el README
└── README.md
```

---

## API Endpoints

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registro | No |
| POST | `/api/auth/login` | Login (Token) | No |
| POST | `/api/auth/recover-password` | Recuperación | No |
| GET | `/api/dashboard` | KPIs por rol | Sí |
| GET/POST/PATCH/DELETE | `/api/empleados[/id]` | CRUD empleados | Sí |
| GET/POST/PATCH | `/api/asistencias[/id]` | Asistencias | Sí |
| GET/POST | `/api/nominas[/id]` | Nóminas | Sí |
| GET/POST | `/api/configuracion-nomina` | Configuración | Sí |

---

## Galería

| Pantalla | Vista |
|----------|-------|
| **Login** | ![Login](frontend/public/assets/readme/login.png) |
| **Registro** | ![Registro](frontend/public/assets/readme/register.png) |
| **Listado de Empleados** | ![Empleados](frontend/public/assets/readme/empleados.png) |
| **Control de Asistencia** | ![Asistencia](frontend/public/assets/readme/asistencias.png) |
| **Nóminas** | ![Nóminas](frontend/public/assets/readme/nominas.png) |
| **Sidebar Expandido** | ![Sidebar](frontend/public/assets/readme/sidebarExpandido.png) |
| **Sidebar Colapsado** | ![Sidebar](frontend/public/assets/readme/sidebarColapsado.png) |
| **Modo Oscuro** | ![Dark](frontend/public/assets/readme/darkMode.png) |

---

## Licencia

Distribuido bajo la licencia MIT. Ver [LICENSE](./LICENSE) para más información.
