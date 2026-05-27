# Management command: python manage.py seed_data
#
# Populates the database with realistic demo data:
#   - 3 user accounts (admin + 2 employees)
#   - 25 employees across 7 departments
#   - Payroll config (10% deduction, $120 bonus)
#   - 60 days of attendance per active employee (skips weekends, ~12% absence)
#   - 6 months of payroll records per active employee

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from empleados.models import Empleado, Asistencia, Nomina, UserProfile, ConfiguracionNomina
from datetime import date, timedelta
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Puebla la base de datos con datos de demostracion'

    def handle(self, *args, **options):
        self.stdout.write('Poblando base de datos con datos demo...')

        # Wipe existing data before seeding
        Nomina.objects.all().delete()
        Asistencia.objects.all().delete()
        Empleado.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        ConfiguracionNomina.objects.all().delete()

        admin_user, _ = User.objects.get_or_create(username='admin')
        admin_user.set_password('admin123')
        admin_user.email = 'admin@rhmanager.com'
        admin_user.save()
        UserProfile.objects.get_or_create(user=admin_user, defaults={'rol': 'admin'})

        emp_user1, _ = User.objects.get_or_create(username='empleado1')
        emp_user1.set_password('empleado123')
        emp_user1.email = 'empleado1@rhmanager.com'
        emp_user1.save()
        UserProfile.objects.get_or_create(user=emp_user1, defaults={'rol': 'empleado'})

        emp_user2, _ = User.objects.get_or_create(username='empleado2')
        emp_user2.set_password('empleado123')
        emp_user2.email = 'empleado2@rhmanager.com'
        emp_user2.save()
        UserProfile.objects.get_or_create(user=emp_user2, defaults={'rol': 'empleado'})

        empleados_data = [
            {'nombre': 'Carlos Mendoza',           'departamento': 'Tecnologia',        'sueldo': 45000, 'puesto': 'Desarrollador Senior',          'estatus': 'Activo',   'correo': 'carlos.mendoza@rhmanager.com',        'telefono': '809-555-1001'},
            {'nombre': 'Ana Lucia Perez',          'departamento': 'Tecnologia',        'sueldo': 38000, 'puesto': 'Desarrolladora Full Stack',     'estatus': 'Activo',   'correo': 'ana.perez@rhmanager.com',           'telefono': '809-555-1002'},
            {'nombre': 'Roberto Gomez',            'departamento': 'Recursos Humanos',  'sueldo': 32000, 'puesto': 'Reclutador Senior',             'estatus': 'Activo',   'correo': 'roberto.gomez@rhmanager.com',       'telefono': '809-555-1003'},
            {'nombre': 'Maria Fernanda Lopez',     'departamento': 'Contabilidad',      'sueldo': 35000, 'puesto': 'Contadora General',             'estatus': 'Activo',   'correo': 'maria.lopez@rhmanager.com',         'telefono': '809-555-1004'},
            {'nombre': 'Jose Daniel Martinez',     'departamento': 'Ventas',            'sueldo': 28000, 'puesto': 'Ejecutivo de Ventas',          'estatus': 'Activo',   'correo': 'jose.martinez@rhmanager.com',       'telefono': '809-555-1005'},
            {'nombre': 'Laura Jimenez',            'departamento': 'Marketing',         'sueldo': 31000, 'puesto': 'Coordinadora de Marketing',     'estatus': 'Activo',   'correo': 'laura.jimenez@rhmanager.com',       'telefono': '809-555-1006'},
            {'nombre': 'Pedro Ramirez',            'departamento': 'Tecnologia',        'sueldo': 42000, 'puesto': 'Arquitecto de Software',       'estatus': 'Activo',   'correo': 'pedro.ramirez@rhmanager.com',       'telefono': '809-555-1007'},
            {'nombre': 'Sofia Torres',             'departamento': 'Recursos Humanos',  'sueldo': 29000, 'puesto': 'Asistente de RH',              'estatus': 'Activo',   'correo': 'sofia.torres@rhmanager.com',        'telefono': '809-555-1008'},
            {'nombre': 'Diego Hernandez',          'departamento': 'Contabilidad',      'sueldo': 26000, 'puesto': 'Auxiliar Contable',            'estatus': 'Inactivo', 'correo': 'diego.hernandez@rhmanager.com',     'telefono': '809-555-1009'},
            {'nombre': 'Valentina Rojas',          'departamento': 'Ventas',            'sueldo': 34000, 'puesto': 'Gerente de Ventas',            'estatus': 'Activo',   'correo': 'valentina.rojas@rhmanager.com',      'telefono': '809-555-1010'},
            {'nombre': 'Andres Felipe Castro',     'departamento': 'Logistica',         'sueldo': 27000, 'puesto': 'Coordinador de Logistica',     'estatus': 'Activo',   'correo': 'andres.castro@rhmanager.com',       'telefono': '809-555-1011'},
            {'nombre': 'Carolina Mejia',           'departamento': 'Logistica',         'sueldo': 24000, 'puesto': 'Analista de Inventarios',       'estatus': 'Activo',   'correo': 'carolina.mejia@rhmanager.com',       'telefono': '809-555-1012'},
            {'nombre': 'Fernando Ortiz',           'departamento': 'Servicio al Cliente','sueldo': 22000,'puesto': 'Representante de Servicio',    'estatus': 'Activo',   'correo': 'fernando.ortiz@rhmanager.com',       'telefono': '809-555-1013'},
            {'nombre': 'Gabriela Reyes',           'departamento': 'Servicio al Cliente','sueldo': 23000,'puesto': 'Supervisora de Servicio',       'estatus': 'Activo',   'correo': 'gabriela.reyes@rhmanager.com',       'telefono': '809-555-1014'},
            {'nombre': 'Hector Delgado',           'departamento': 'Diseño',            'sueldo': 36000, 'puesto': 'Disenador UX/UI',              'estatus': 'Activo',   'correo': 'hector.delgado@rhmanager.com',       'telefono': '809-555-1015'},
            {'nombre': 'Isabela Morales',          'departamento': 'Diseño',            'sueldo': 33000, 'puesto': 'Disenadora Grafica',           'estatus': 'Activo',   'correo': 'isabela.morales@rhmanager.com',      'telefono': '809-555-1016'},
            {'nombre': 'Javier Santana',           'departamento': 'Administracion',    'sueldo': 40000, 'puesto': 'Gerente Administrativo',        'estatus': 'Activo',   'correo': 'javier.santana@rhmanager.com',       'telefono': '809-555-1017'},
            {'nombre': 'Karen Paredes',            'departamento': 'Administracion',    'sueldo': 25000, 'puesto': 'Asistente Administrativa',      'estatus': 'Activo',   'correo': 'karen.paredes@rhmanager.com',        'telefono': '809-555-1018'},
            {'nombre': 'Luis Miguel Torres',       'departamento': 'Tecnologia',        'sueldo': 48000, 'puesto': 'Ingeniero de DevOps',           'estatus': 'Activo',   'correo': 'luis.torres@rhmanager.com',          'telefono': '809-555-1019'},
            {'nombre': 'Monica Guerrero',          'departamento': 'Marketing',         'sueldo': 30000, 'puesto': 'Especialista en Redes Sociales','estatus': 'Suspendido','correo': 'monica.guerrero@rhmanager.com',       'telefono': '809-555-1020'},
            {'nombre': 'Nelson Pena',              'departamento': 'Ventas',            'sueldo': 26000, 'puesto': 'Ejecutivo de Cuentas Clave',    'estatus': 'Activo',   'correo': 'nelson.pena@rhmanager.com',          'telefono': '809-555-1021'},
            {'nombre': 'Olivia Sandoval',          'departamento': 'Recursos Humanos',  'sueldo': 34000, 'puesto': 'Especialista en Nominas',       'estatus': 'Activo',   'correo': 'olivia.sandoval@rhmanager.com',      'telefono': '809-555-1022'},
            {'nombre': 'Pablo Estrada',            'departamento': 'Logistica',         'sueldo': 31000, 'puesto': 'Jefe de Almacen',              'estatus': 'Activo',   'correo': 'pablo.estrada@rhmanager.com',        'telefono': '809-555-1023'},
            {'nombre': 'Raquel Fernandez',         'departamento': 'Contabilidad',      'sueldo': 29000, 'puesto': 'Analista Financiera',           'estatus': 'Inactivo', 'correo': 'raquel.fernandez@rhmanager.com',      'telefono': '809-555-1024'},
            {'nombre': 'Samuel Cruz',              'departamento': 'Tecnologia',        'sueldo': 35000, 'puesto': 'Administrador de BD',           'estatus': 'Activo',   'correo': 'samuel.cruz@rhmanager.com',          'telefono': '809-555-1025'},
        ]

        empleados_creados = []
        for idx, data in enumerate(empleados_data):
            emp, created = Empleado.objects.get_or_create(
                correo_corporativo=data['correo'],
                defaults={
                    'nombre': data['nombre'],
                    'departamento': data['departamento'],
                    'sueldo': data['sueldo'],
                    'puesto': data['puesto'],
                    'estatus': data['estatus'],
                    'telefono': data['telefono'],
                    'fecha_contratacion': date(2024, random.randint(1, 12), random.randint(1, 28)),
                }
            )
            empleados_creados.append(emp)

        # Link empleado1 to first employee (Carlos Mendoza) and empleado2 to third (Roberto Gomez)
        if empleados_creados:
            emp_user1.empleado = empleados_creados[0]
            emp_user1.save()
            emp_user2.empleado = empleados_creados[2]
            emp_user2.save()

        # Create default payroll config
        ConfiguracionNomina.objects.create(
            porcentaje_deduccion=Decimal('10.00'),
            bono_fijo=Decimal('120.00'),
        )

        # Generate 60 days of attendance for active employees
        hoy = date.today()
        empleados_activos = Empleado.objects.filter(estatus='Activo')
        for emp in empleados_activos:
            for dias_atras in range(60):
                dia = hoy - timedelta(days=dias_atras)
                if dia.weekday() >= 5:
                    continue
                if random.random() < 0.12:
                    continue

                hora_ent = f'{random.randint(7, 9):02d}:{random.randint(0, 59):02d}:00'
                estado = 'Retardo' if hora_ent > '09:00:00' else 'A Tiempo'
                hora_sal = f'{random.randint(16, 18):02d}:{random.randint(0, 59):02d}:00'

                Asistencia.objects.get_or_create(
                    empleado=emp,
                    fecha=dia,
                    defaults={
                        'hora_entrada': hora_ent,
                        'hora_salida': hora_sal,
                        'estado': estado,
                    }
                )

        # Generate 6 months of payroll records for active employees
        for emp in empleados_activos:
            for mes in range(6):
                referencia = date(hoy.year, hoy.month, 1)
                for _ in range(mes):
                    referencia = referencia.replace(day=1) - timedelta(days=1)
                fecha_pago = referencia.replace(day=1) - timedelta(days=1)
                if fecha_pago > hoy:
                    continue
                sueldo_base = emp.sueldo
                deduccion_pct = Decimal(str(random.uniform(8, 14))).quantize(Decimal('0.01'))
                deducciones = (sueldo_base * deduccion_pct / Decimal('100')).quantize(Decimal('0.01'))
                bonos = Decimal(str(random.randint(80, 200))).quantize(Decimal('0.01'))
                sueldo_neto = (sueldo_base - deducciones + bonos).quantize(Decimal('0.01'))

                Nomina.objects.get_or_create(
                    empleado=emp,
                    fecha_pago=fecha_pago,
                    defaults={
                        'sueldo_base': sueldo_base,
                        'deducciones': deducciones,
                        'bonos': bonos,
                        'sueldo_neto': sueldo_neto,
                    }
                )

        self.stdout.write(self.style.SUCCESS(
            f'Datos demo creados exitosamente: '
            f'{Empleado.objects.count()} empleados, '
            f'{Asistencia.objects.count()} asistencias, '
            f'{Nomina.objects.count()} nominas'
        ))
