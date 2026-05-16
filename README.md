# RH Django - Full Stack HR Management

Sistema de gestión de Recursos Humanos con Django REST API backend y React frontend.

## Proyectos

### `/backend` - Django REST API
API para CRUD de empleados con Django y Django REST Framework, base de datos MySQL.

```
cd backend
python manage.py runserver
```

### `/frontend` - React + Vite
Interfaz de usuario para listado y gestión de empleados.

```
cd frontend
npm install
npm run dev
```

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/empleados` | Listar todos los empleados |
| POST | `/api/empleados` | Crear un empleado |
| GET | `/api/empleados/<id>` | Obtener un empleado por ID |
| PUT | `/api/empleados/<id>` | Actualizar un empleado |
| PATCH | `/api/empleados/<id>` | Actualización parcial |
| DELETE | `/api/empleados/<id>` | Eliminar un empleado |
