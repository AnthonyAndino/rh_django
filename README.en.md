<div align="center">

# RH Manager · Human Resources Management System

![React](https://img.shields.io/badge/React_19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/Django_5-092E20?logo=django&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

Dashboard · Attendance · Payroll · Role-Based Auth · **Sand & Terracotta** Design

</div>

---

## Preview

| Screen | Preview |
|--------|---------|
| **Login** | ![Login](public/assets/readme/login.png) |
| **Dashboard** | ![Dashboard](public/assets/readme/dashboard.png) |
| **Employee List** | ![Employees](public/assets/readme/empleados.png) |
| **Attendance Control** | ![Attendance](public/assets/readme/asistencias.png) |
| **Payroll** | ![Payroll](public/assets/readme/nominas.png) |
| **Sidebar** | ![Sidebar](public/assets/readme/sidebarExpandido.png) |
| **Collapsed Sidebar** | ![Sidebar](public/assets/readme/sidebarColapsado.png) |
| **Dark Mode** | ![Dark](public/assets/readme/darkMode.png) |

---

## Features

### Frontend (React + Vite)
- **Optimized Pagination** — Truncated page ranges with ellipsis and navigation arrows.
- **Advanced Filters** — Custom-built minimal employee select and animated date picker using Lucide React.
- **Sortable Tables** — Click column headers to sort by any field with direction indicators.
- **Fluid Authentication** — Login, registration, and password recovery with animated background spheres and glassmorphism cards.
- **Responsive Sidebar** — Collapsible with localStorage persistence, role-based menu items, anchored footer.
- **Full Dark Mode** — Consistent dark palette across all components, not a simple color inversion.
- **CSV Export** with UTF-8 BOM for Excel compatibility.

### Backend (Django REST Framework)
- Token-based authentication (DRF TokenAuth).
- Complete employee CRUD with profile photo upload.
- Attendance module with automatic late detection (> 8:05 AM).
- Monthly payroll calculation with deductions, bonuses, and historical storage.
- Role-based dashboard KPIs (admin / employee).
- Demo data seeder (10 employees, 30 days of attendance, 3 months of payroll).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Router 7, Bootstrap 5, Lucide React |
| **Custom Components** | `ThSortable`, `Pagination`, `ScrollableTable`, `MinimalSelect`, `MinimalDatePicker` |
| **Charts** | Recharts |
| **Backend** | Django 5, Django REST Framework, MySQL 8 |
| **Formatting** | `react-number-format` |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env   # Edit with your MySQL credentials
python manage.py migrate
python manage.py seed_data   # Demo data
python manage.py runserver
```

Demo users:
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Administrator |
| `empleado1` | `empleado123` | Employee |

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Available Scripts

```bash
npm run dev       # Development with HMR
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Project Structure

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
│   │   ├── AuthContext.jsx      # Token-based authentication
│   │   ├── Navegacion.jsx       # Responsive sidebar
│   │   └── index.css            # Complete Sand & Terracotta design system
│   └── public/assets/readme/    # README screenshots
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/login` | Login (Token) | No |
| POST | `/api/auth/recover-password` | Password recovery | No |
| GET | `/api/dashboard` | Role-based KPIs | Yes |
| GET/POST/PATCH/DELETE | `/api/empleados[/id]` | Employee CRUD | Yes |
| GET/POST/PATCH | `/api/asistencias[/id]` | Attendance | Yes |
| GET/POST | `/api/nominas[/id]` | Payroll | Yes |
| GET/POST | `/api/configuracion-nomina` | Settings | Yes |

---

## Project Evaluation

> **Overall score: 8.5/10** — Portfolio-ready with room to grow.

### Strengths
- **Strong visual identity** — The Sand & Terracotta palette is memorable and consistent across every screen. Dark mode has component-specific adjustments, not global inversion.
- **Reusable components** — `ThSortable`, `Pagination`, `MinimalSelect`, and `MinimalDatePicker` are decoupled and ready for any table or form.
- **Smooth UX** — Scroll-free sidebar, context-preserving pagination, fluid transitions, flash-free authentication.
- **Polished responsive** — Collapsible sidebar, horizontally-scrollable tables, compact mobile inputs.
- **Premium dark mode** — Specific colors for spheres, glassmorphism, and every UI element.

### Areas for Improvement
- **Automated testing** — No unit or E2E tests. Adding Vitest + Playwright would significantly boost the project's profile.
- **Empty & loading states** — Some tables lack skeleton screens or illustrated empty-state messages.
- **Error handling** — API error responses could have more visual variants (toast notifications).
- **Backend** — Additional validations and structured logging would improve robustness.

---

## Suggested Next Steps

| Feature | Impact | Effort |
|---------|--------|--------|
| **Real-time notifications** (new attendance, employee created) via WebSocket | High | Medium |
| **PDF export** for payroll and attendance reports with corporate design | High | Low |
| **Advanced analytics charts** (late trends by department, monthly payroll comparisons) | Medium | Medium |
| **Configurable roles** with granular permissions from an admin UI | High | High |

---

## Screenshot Guide

Save images to `frontend/public/assets/readme/` with these filenames:

| File | Content |
|------|---------|
| `login.png` | Login with animated spheres and glassmorphism |
| `register.png` | Registration with inverted spheres |
| `dashboard.png` | Dashboard with KPIs, table, and chart |
| `empleados.png` | Employee list with filters, pagination, and export |
| `asistencias.png` | Attendance checker + employee/date filters |
| `nominas.png` | Payroll generation and historical table |
| `sidebarExpandido.png` | Full expanded sidebar with all sections |
| `sidebarColapsado.png` | Collapsed sidebar with icons only |
| `darkMode.png` | Full dashboard in dark mode |

---

## License

```
MIT License — Copyright (c) 2026
```
