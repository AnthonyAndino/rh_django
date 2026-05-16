from rest_framework import serializers
from .models import Empleado

class EmpleadoSerializer(serializers.ModelSerializer):
    idEmpleado = serializers.IntegerField(read_only=True)

    class Meta:
        model = Empleado
        fields = ['idEmpleado', 'nombre', 'departamento', 'sueldo']

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