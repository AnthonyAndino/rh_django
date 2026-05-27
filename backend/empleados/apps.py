# Django app config for the 'empleados' module.
# Registers this app so Django discovers models, migrations,
# management commands, and admin registrations.
from django.apps import AppConfig


class EmpleadosConfig(AppConfig):
    name = 'empleados'
