# API views for the RRHH management system.
#
# Endpoints are role-aware: admin users get full CRUD and company-wide data;
# regular employees see only their own records (self-service portal).
#
# Auth endpoints (register/login/recover) are public (AllowAny).

from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from datetime import date
from .models import Empleado, Asistencia, Nomina, UserProfile, ConfiguracionNomina
from .serializers import (
    EmpleadoSerializer, AsistenciaSerializer, NominaSerializer, 
    ConfiguracionNominaSerializer
)


class IsAdminRole(permissions.BasePermission):
    """Custom permission: only users with profile.rol == 'admin' may proceed."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and 
            request.user.profile.rol == 'admin'
        )


# --- EMPLOYEE ENDPOINTS ---

class EmpleadoListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = EmpleadoSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            return Empleado.objects.filter(user=user)
        return Empleado.objects.all().order_by('idEmpleado')


class EmpleadoRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmpleadoSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            return Empleado.objects.filter(user=user)
        return Empleado.objects.all()


# --- ATTENDANCE ENDPOINTS ---

class AsistenciaListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AsistenciaSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Asistencia.objects.all().order_by('-fecha', '-hora_entrada')
        
        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            queryset = queryset.filter(empleado__user=user)
        else:
            empleado_id = self.request.query_params.get('empleado_id')
            fecha_inicio = self.request.query_params.get('fecha_inicio')
            fecha_fin = self.request.query_params.get('fecha_fin')
            
            if empleado_id:
                queryset = queryset.filter(empleado_id=empleado_id)
            if fecha_inicio:
                queryset = queryset.filter(fecha__gte=fecha_inicio)
            if fecha_fin:
                queryset = queryset.filter(fecha__lte=fecha_fin)
                
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            if hasattr(user, 'empleado'):
                serializer.save(empleado=user.empleado)
            else:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'error': 'Tu cuenta de usuario no está enlazada a ningún empleado corporativo.'})
        else:
            serializer.save()


class AsistenciaRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Asistencia.objects.all()
    serializer_class = AsistenciaSerializer


# --- PAYROLL ENDPOINTS ---

class NominaListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = NominaSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [permissions.IsAuthenticated()]

    def post(self, request, *args, **kwargs):
        fecha_pago = request.data.get('fecha_pago')
        if fecha_pago:
            from django.db import connection
            try:
                with connection.cursor() as cursor:
                    cursor.callproc('GenerarNominaMensual', [fecha_pago])
                return Response({'message': '¡Nóminas del periodo generadas con éxito!'}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': 'Error al generar la nómina. Verifica que hayan empleados activos con salario registrado.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            return Nomina.objects.filter(empleado__user=user).order_by('-fecha_pago')
        return Nomina.objects.all().order_by('-fecha_pago')


class ConfiguracionNominaListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAdminRole]
    queryset = ConfiguracionNomina.objects.all().order_by('-idConfiguracion')
    serializer_class = ConfiguracionNominaSerializer


# --- DASHBOARD ENDPOINT ---

class DashboardAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        hoy = date.today()
        mes_actual = hoy.month
        anio_actual = hoy.year

        if hasattr(user, 'profile') and user.profile.rol == 'empleado':
            if not hasattr(user, 'empleado'):
                return Response({
                    'es_empleado': True,
                    'total_asistencias': 0,
                    'retardos_acumulados': 0,
                    'nomina_pagada_mes': 0,
                    'ultimas_asistencias': []
                })
            
            emp = user.empleado
            total_asistencias = Asistencia.objects.filter(empleado=emp).count()
            retardos = Asistencia.objects.filter(empleado=emp, estado__icontains='Retardo').count()
            nomina_recibida = Nomina.objects.filter(empleado=emp, fecha_pago__month=mes_actual, fecha_pago__year=anio_actual).aggregate(total=Sum('sueldo_neto'))['total'] or 0.00
            ultimas = Asistencia.objects.filter(empleado=emp).order_by('-fecha', '-hora_entrada')[:5]
            
            return Response({
                'es_empleado': True,
                'total_asistencias': total_asistencias,
                'retardos_acumulados': retardos,
                'nomina_pagada_mes': float(nomina_recibida),
                'ultimas_asistencias': AsistenciaSerializer(ultimas, many=True).data
            })
            
        else:
            total_empleados = Empleado.objects.filter(estatus='Activo').count()
            asistencias_hoy = Asistencia.objects.filter(fecha=hoy).count()
            retardos_hoy = Asistencia.objects.filter(fecha=hoy, estado__icontains='Retardo').count()
            
            nomina_pagada = Nomina.objects.filter(
                fecha_pago__month=mes_actual, 
                fecha_pago__year=anio_actual
            ).aggregate(total=Sum('sueldo_neto'))['total'] or 0.00

            empleados_por_departamento = Empleado.objects.values('departamento').annotate(cantidad=Count('idEmpleado')).order_by('departamento')

            ultimas_asistencias = Asistencia.objects.filter(fecha=hoy).order_by('-hora_entrada')[:5]
            if len(ultimas_asistencias) == 0:
                ultimas_asistencias = Asistencia.objects.all().order_by('-fecha', '-hora_entrada')[:5]

            return Response({
                'es_empleado': False,
                'total_empleados': total_empleados,
                'asistencias_hoy': asistencias_hoy,
                'retardos_hoy': retardos_hoy,
                'nomina_pagada_mes': float(nomina_pagada),
                'empleados_por_departamento': list(empleados_por_departamento),
                'ultimas_asistencias': AsistenciaSerializer(ultimas_asistencias, many=True).data
            })


# --- AUTH ENDPOINTS ---

class RegistroView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        rol = request.data.get('rol', 'empleado')

        if not username or not email or not password:
            return Response({'error': 'Por favor rellena todos los campos'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'El nombre de usuario ya está en uso'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # First user to register is auto-assigned admin role
        if User.objects.count() == 1:
            rol = 'admin'
            
        UserProfile.objects.create(user=user, rol=rol)
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'username': user.username,
                'email': user.email,
                'rol': rol,
                'idEmpleado': None
            }
        }, status=status.HTTP_201_CREATED)


class CustomObtainAuthToken(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            
            profile, created = UserProfile.objects.get_or_create(user=user)
            rol = profile.rol
            
            id_empleado = user.empleado.idEmpleado if hasattr(user, 'empleado') else None
            
            return Response({
                'token': token.key,
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'rol': rol,
                    'idEmpleado': id_empleado
                }
            })
        else:
            return Response({'error': 'Credenciales incorrectas'}, status=status.HTTP_400_BAD_REQUEST)


class RecuperarPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'El correo es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        usuario_existe = User.objects.filter(email=email).exists()
        
        if usuario_existe:
            return Response({'message': 'Se ha enviado un enlace de recuperación a su correo electrónico.'})
        else:
            return Response({'error': 'No encontramos ninguna cuenta con ese correo electrónico.'}, status=status.HTTP_404_NOT_FOUND)