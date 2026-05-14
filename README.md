# rh_django

API RESTful para gestión de empleados (Recursos Humanos) construida con Django y Django REST Framework.

## Tecnologías

- **Python 3.12**
- **Django 6.0**
- **Django REST Framework 3.17**
- **MySQL** (base de datos)
- **django-cors-headers** (CORS para frontend Angular/React)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/AnthonyAndino/rh_django.git
   cd rh_django
   ```

2. Crea y activa el entorno virtual:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

3. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```

4. Configura la base de datos MySQL en `rh_django/settings.py`.

5. Ejecuta las migraciones:
   ```bash
   python manage.py migrate
   ```

6. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/empleados` | Listar todos los empleados |
| POST | `/api/empleados` | Crear un empleado |
| GET | `/api/empleados/<id>` | Obtener un empleado por ID |
| PUT | `/api/empleados/<id>` | Actualizar un empleado |
| PATCH | `/api/empleados/<id>` | Actualización parcial |
| DELETE | `/api/empleados/<id>` | Eliminar un empleado |

## Modelo

**Empleado**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| idEmpleado | AutoField | ID autoincremental |
| nombre | CharField(255) | Nombre del empleado |
| departamento | CharField(100) | Departamento |
| sueldo | DecimalField(10,2) | Salario |
