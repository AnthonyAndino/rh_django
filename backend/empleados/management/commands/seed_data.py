from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from empleados.models import Empleado, Asistencia, Nomina, UserProfile, ConfiguracionNomina
from datetime import date, timedelta, datetime
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Puebla la base de datos con datos de demostracion'

    def handle(self, *args, **options):
        self.stdout.write('Poblando base de datos con datos demo...')

        # Limpiar datos existentes para evitar duplicados
        Nomina.objects.all().delete()
        Asistencia.objects.all().delete()
        Empleado.objects.all().delete()
        UserProfile.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        ConfiguracionNomina.objects.all().delete()

        # --- Usuario admin ---
        admin_user, _ = User.objects.get_or_create(username='admin')
        admin_user.set_password('admin123')
        admin_user.email = 'admin@rhmanager.com'
        admin_user.save()
        UserProfile.objects.get_or_create(user=admin_user, defaults={'rol': 'admin'})

        # --- Usuario empleado ---
        emp_user, _ = User.objects.get_or_create(username='empleado1')
        emp_user.set_password('empleado123')
        emp_user.email = 'empleado1@rhmanager.com'
        emp_user.save()
        UserProfile.objects.get_or_create(user=emp_user, defaults={'rol': 'empleado'})

        # --- Empleados demo ---
        empleados_data = [
            {'nombre': 'Carlos Mendoza', 'departamento': 'Tecnologia', 'sueldo': 45000, 'puesto': 'Desarrollador Senior', 'estatus': 'Activo', 'correo': 'carlos.mendoza@rhmanager.com'},
            {'nombre': 'Ana Lucia Perez', 'departamento': 'Tecnologia', 'sueldo': 38000, 'puesto': 'Desarrolladora Full Stack', 'estatus': 'Activo', 'correo': 'ana.perez@rhmanager.com'},
            {'nombre': 'Roberto Gomez', 'departamento': 'Recursos Humanos', 'sueldo': 32000, 'puesto': 'Reclutador Senior', 'estatus': 'Activo', 'correo': 'roberto.gomez@rhmanager.com'},
            {'nombre': 'Maria Fernanda Lopez', 'departamento': 'Contabilidad', 'sueldo': 35000, 'puesto': 'Contadora General', 'estatus': 'Activo', 'correo': 'maria.lopez@rhmanager.com'},
            {'nombre': 'Jose Daniel Martinez', 'departamento': 'Ventas', 'sueldo': 28000, 'puesto': 'Ejecutivo de Ventas', 'estatus': 'Activo', 'correo': 'jose.martinez@rhmanager.com'},
            {'nombre': 'Laura Jimenez', 'departamento': 'Marketing', 'sueldo': 31000, 'puesto': 'Coordinadora de Marketing', 'estatus': 'Activo', 'correo': 'laura.jimenez@rhmanager.com'},
            {'nombre': 'Pedro Ramirez', 'departamento': 'Tecnologia', 'sueldo': 42000, 'puesto': 'Arquitecto de Software', 'estatus': 'Activo', 'correo': 'pedro.ramirez@rhmanager.com'},
            {'nombre': 'Sofia Torres', 'departamento': 'Recursos Humanos', 'sueldo': 29000, 'puesto': 'Asistente de RH', 'estatus': 'Activo', 'correo': 'sofia.torres@rhmanager.com'},
            {'nombre': 'Diego Hernandez', 'departamento': 'Contabilidad', 'sueldo': 26000, 'puesto': 'Auxiliar Contable', 'estatus': 'Inactivo', 'correo': 'diego.hernandez@rhmanager.com'},
            {'nombre': 'Valentina Rojas', 'departamento': 'Ventas', 'sueldo': 34000, 'puesto': 'Gerente de Ventas', 'estatus': 'Activo', 'correo': 'valentina.rojas@rhmanager.com'},
        ]

        empleados_creados = []
        for data in empleados_data:
            emp, created = Empleado.objects.get_or_create(
                correo_corporativo=data['correo'],
                defaults={
                    'nombre': data['nombre'],
                    'departamento': data['departamento'],
                    'sueldo': data['sueldo'],
                    'puesto': data['puesto'],
                    'estatus': data['estatus'],
                    'fecha_contratacion': date(2025, random.randint(1, 12), random.randint(1, 28)),
                }
            )
            empleados_creados.append(emp)

        # Vincular el usuario empleado al primer empleado
        if empleados_creados:
            emp_user.empleado = empleados_creados[0]
            emp_user.save()

        # --- Configuracion de nomina ---
        ConfiguracionNomina.objects.create(
            porcentaje_deduccion=Decimal('10.00'),
            bono_fijo=Decimal('120.00'),
        )

        # --- Asistencias demo (ultimos 30 dias) ---
        hoy = date.today()
        empleados_activos = Empleado.objects.filter(estatus='Activo')
        for emp in empleados_activos:
            for dias_atras in range(30):
                dia = hoy - timedelta(days=dias_atras)
                if dia.weekday() >= 5:
                    continue  # Saltar fines de semana
                if random.random() < 0.15:
                    continue  # 15% de ausentismo

                hora_ent = f'{random.randint(7, 9):02d}:{random.randint(0, 59):02d}:00'
                if hora_ent > '09:00:00':
                    estado = 'Retardo'
                else:
                    estado = 'A Tiempo'

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

        # --- Nominas demo (ultimos 3 meses) ---
        for emp in empleados_activos:
            for mes in range(3):
                fecha_pago = date(hoy.year, hoy.month - mes, 1) - timedelta(days=1)
                if fecha_pago > hoy:
                    continue
                sueldo_base = emp.sueldo
                deducciones = sueldo_base * Decimal('0.10')
                bonos = Decimal('120.00')
                sueldo_neto = sueldo_base - deducciones + bonos

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
