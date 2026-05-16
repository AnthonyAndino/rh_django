from django.db import models

class Empleado(models.Model):
    idEmpleado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    departamento = models.CharField(max_length=100)
    sueldo = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'empleados'

    def __str__(self):
        return f'{self.idEmpleado} - {self.nombre} ({self.departamento})'