from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),  # Add root redirect
    path('admin/', admin.site.urls),
    path('api/', include('study_assistant.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 