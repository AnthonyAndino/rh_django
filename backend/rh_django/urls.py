# Root URL configuration for rh_django.
# Routes /admin/ to Django admin and everything else to the empleados app.
# In DEBUG mode, also serves uploaded media files (profile photos).
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('empleados.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
