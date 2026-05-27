# Database models for the RRHH management system.
#
# Empleado      — Core employee directory with corporate fields and profile photo.
# Asistencia    — Daily attendance records (entry/exit times,迟到 status).
# Nomina        — Monthly payroll records per employee.
# ConfiguracionNomina — Global payroll parameters (deduction %, fixed bonus).
# UserProfile   — Extends Django's User with role field (admin/empleado).

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """One-to-one profile extending Django's User with role-based access."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    rol = models.CharField(max_length=20, default='empleado')

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f'{self.user.username} ({self.rol})'


class Empleado(models.Model):
    """Employee record with corporate info, status, and optional user link."""
    idEmpleado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    departamento = models.CharField(max_length=100)
    sueldo = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_contratacion = models.DateField(null=True, blank=True)
    puesto = models.CharField(max_length=150, default='Colaborador')
    correo_corporativo = models.EmailField(unique=True, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    estatus = models.CharField(max_length=50, default='Activo')
    foto_perfil = models.FileField(upload_to='foto_perfil/', null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='empleado')

    class Meta:
        db_table = 'empleados'
        
    def __str__(self):
        return f'{self.idEmpleado} - {self.nombre} ({self.puesto})'


class Asistencia(models.Model):
    """Daily attendance record linked to an employee."""
    idAsistencia = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='idEmpleado', related_name='asistencias')
    fecha = models.DateField()
    hora_entrada = models.TimeField()
    hora_salida = models.TimeField(null=True, blank=True)
    estado = models.CharField(max_length=50, default='A Tiempo')
    
    class Meta: 
        db_table = 'asistencia'


class Nomina(models.Model):
    """Monthly payroll record for an employee."""
    idNomina = models.AutoField(primary_key=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, db_column='idEmpleado', related_name='nominas')
    fecha_pago = models.DateField()
    sueldo_base = models.DecimalField(max_digits=10, decimal_places=2)
    deducciones = models.DecimalField(max_digits=10, decimal_places=2)
    bonos = models.DecimalField(max_digits=10, decimal_places=2)
    sueldo_neto = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'nominas'


class ConfiguracionNomina(models.Model):
    """Global payroll configuration: deduction % and fixed bonus amount."""
    idConfiguracion = models.AutoField(primary_key=True)
    porcentaje_deduccion = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    bono_fijo = models.DecimalField(max_digits=10, decimal_places=2, default=120.00)
    fecha_vigencia = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'configuracion_nomina'

