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

---

## Vista Previa

| Pantalla | Vista |
|----------|-------|
| **Login** | ![Login](public/assets/readme/login.png) |
| **Dashboard** | ![Dashboard](public/assets/readme/dashboard.png) |
| **Listado de Empleados** | ![Empleados](public/assets/readme/empleados.png) |
| **Control de Asistencia** | ![Asistencia](public/assets/readme/asistencias.png) |
| **Nóminas** | ![Nóminas](public/assets/readme/nominas.png) |
| **Sidebar** | ![Sidebar](public/assets/readme/sidebarExpandido.png) |
| **Sidebar Colapsado** | ![Sidebar](public/assets/readme/sidebarColapsado.png) |
| **Modo Oscuro** | ![Dark](public/assets/readme/darkMode.png) |

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

## Evaluación del Proyecto

> **Puntaje general: 8.5/10** — Listo para portafolio, con espacio para crecer.

### Fortalezas
- **Identidad visual sólida** — La paleta Sand & Terracotta es memorable y consistente en cada pantalla. El modo oscuro no es un afterthought; tiene ajustes específicos por componente.
- **Componentes reutilizables** — `ThSortable`, `Pagination`, `MinimalSelect` y `MinimalDatePicker` están desacoplados y pueden usarse en cualquier tabla o formulario.
- **UX fluida** — Sidebar sin scroll interno, paginación que no pierde contexto, transiciones suaves, autenticación sin flashes blancos.
- **Responsive bien resuelto** — Sidebar colapsable, tablas con scroll horizontal, inputs compactos en mobile.
- **Modo oscuro premium** — No es un simple invert: tiene colores específicos para spheres, glassmorphism y cada componente.

### Áreas de mejora
- **Pruebas automatizadas** — Sin tests unitarios ni E2E. Agregar testing con Vitest + Playwright subiría considerablemente el perfil del proyecto.
- **Estados vacíos y de carga** — Algunas tablas no tienen skeleton screens ni mensajes ilustrados cuando no hay datos.
- **Manejo de errores** — Las respuestas de error de la API podrían tener más variantes visuales (toast notifications).
- **Backend** — Validaciones adicionales y logging estructurado mejorarían la robustez.

---

## Próximos Pasos Sugeridos

| Funcionalidad | Impacto | Esfuerzo |
|--------------|---------|----------|
| **Notificaciones en tiempo real** (nuevas asistencias, empleados creados) con WebSocket | Alto | Medio |
| **Exportación a PDF** de nóminas y reportes de asistencia con diseño corporativo | Alto | Bajo |
| **Gráficas analíticas avanzadas** (tendencias de retardos por departamento, comparativa de nóminas por mes) | Medio | Medio |
| **Roles configurables** con permisos granulares desde una interfaz de administración | Alto | Alto |

---

## Capturas Recomendadas

Guarda las imágenes en `frontend/public/assets/readme/` y asígnale estos nombres:

| Archivo | Contenido |
|---------|-----------|
| `login.png` | Login con esferas animadas y glassmorphism |
| `register.png` | Registro con esferas invertidas |
| `dashboard.png` | Dashboard con KPIs, tabla y gráfica |
| `empleados.png` | Listado con filtros, paginación y acción de exportar |
| `asistencias.png` | Checador + filtros de empleado y fechas |
| `nominas.png` | Generación de nómina y tabla histórica |
| `sidebarExpandido.png` | Sidebar expandido con todas las secciones |
| `sidebarColapsado.png` | Sidebar colapsado, solo iconos |
| `darkMode.png` | Dashboard completo en modo oscuro |

---

## Licencia

```
MIT License — Copyright (c) 2026
```
