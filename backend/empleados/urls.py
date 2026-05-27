# URL routing for the empleados API.
# Maps all REST endpoints: employees CRUD, attendance, payroll,
# payroll config, dashboard, and authentication (register/login/recover).
from django.urls import path
from .views import (
    EmpleadoListCreateAPIView,
    EmpleadoRetrieveUpdateDestroyAPIView,
    AsistenciaListCreateAPIView,
    AsistenciaRetrieveUpdateDestroyAPIView,
    NominaListCreateAPIView,
    ConfiguracionNominaListCreateAPIView,
    DashboardAPIView,
    RegistroView,            
    CustomObtainAuthToken,    
    RecuperarPasswordView 
)

urlpatterns = [
    path('api/empleados', EmpleadoListCreateAPIView.as_view(), name='empleado-list-create'),
    path('api/empleados/<int:pk>', EmpleadoRetrieveUpdateDestroyAPIView.as_view(), name='empleado-detail'),
    
    path('api/asistencias', AsistenciaListCreateAPIView.as_view(), name='asistencia-list-create'),
    path('api/asistencias/<int:pk>', AsistenciaRetrieveUpdateDestroyAPIView.as_view(), name='asistencia-detail'),
    
    path('api/nominas', NominaListCreateAPIView.as_view(), name='nomina-list'),
    path('api/configuracion-nomina', ConfiguracionNominaListCreateAPIView.as_view(), name='configuracion-nomina-list-create'),
    
    path('api/dashboard', DashboardAPIView.as_view(), name='dashboard'),
    
    path('api/auth/register', RegistroView.as_view(), name='auth-register'),
    path('api/auth/login', CustomObtainAuthToken.as_view(), name='auth-login'),
    path('api/auth/recover-password', RecuperarPasswordView.as_view(), name='auth-recover-password'),
]