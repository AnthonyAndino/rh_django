# DRF serializers for all empleados models.
# Handles validation, field-level read-only flags, and
# exposes related employee names on attendance/payroll records.

from rest_framework import serializers
from .models import Empleado, Asistencia, Nomina, ConfiguracionNomina


class EmpleadoSerializer(serializers.ModelSerializer):
    idEmpleado = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Empleado
        fields = [
            'idEmpleado', 'nombre', 'departamento', 'sueldo',
            'fecha_contratacion', 'puesto', 'correo_corporativo', 
            'telefono', 'estatus', 'foto_perfil', 'user'
        ]
        
    def validate_nombre(self, value: str):
        v = (value or '').strip()
        if not v:
            raise serializers.ValidationError('El nombre es requerido')
        return v

    def validate_departamento(self, value: str):
        v = (value or '').strip()
        if not v:
            raise serializers.ValidationError('El departamento es requerido')
        return v

    def validate_sueldo(self, value):
        if value is None:
            raise serializers.ValidationError('El sueldo es requerido')
        if value <= 0:
            raise serializers.ValidationError('El sueldo debe ser mayor a 0')
        return value
    

class AsistenciaSerializer(serializers.ModelSerializer):
    idAsistencia = serializers.IntegerField(read_only=True)
    nombre_empleado = serializers.CharField(source='empleado.nombre', read_only=True)
    
    class Meta:
        model = Asistencia
        fields = ['idAsistencia', 'empleado', 'nombre_empleado', 'fecha', 'hora_entrada', 'hora_salida', 'estado']


class NominaSerializer(serializers.ModelSerializer):
    idNomina = serializers.IntegerField(read_only=True)
    nombre_empleado = serializers.CharField(source='empleado.nombre', read_only=True)
    
    class Meta:
        model = Nomina
        fields = ['idNomina', 'empleado', 'nombre_empleado', 'fecha_pago', 'sueldo_base', 'deducciones', 'bonos', 'sueldo_neto']


class ConfiguracionNominaSerializer(serializers.ModelSerializer):
    idConfiguracion = serializers.IntegerField(read_only=True)

    class Meta:
        model = ConfiguracionNomina
        fields = ['idConfiguracion', 'porcentaje_deduccion', 'bono_fijo', 'fecha_vigencia']
        