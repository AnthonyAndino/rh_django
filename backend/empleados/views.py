from rest_framework import generics
from .models import Empleado, Asistencia, Nomina
from .serializers import EmpleadoSerializer, AsistenciaSerializer, NominaSerializer

class EmpleadoListCreateAPIView(generics.ListCreateAPIView):
    queryset = Empleado.objects.all().order_by('idEmpleado')
    serializer_class = EmpleadoSerializer

class EmpleadoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class AsistenciaListCreateAPIView(generics.ListCreateAPIView):
    queryset = Asistencia.objects.all().order_by('-fecha', '-hora_entrada')
    serializer_class = AsistenciaSerializer   
     
class NominaListCreateAPIView(generics.ListCreateAPIView):
    queryset = Nomina.objects.all().order_by('-fecha_pago')
    serializer_class = NominaSerializer