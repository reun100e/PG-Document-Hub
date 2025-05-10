from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core_api.urls")),
    # Serve React App
    # This should be the last URL pattern
    re_path(
        r"^.*$", TemplateView.as_view(template_name="index.html"), name="react_app"
    ),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # Whitenoise handles static in prod, Django dev server handles in dev for admin.
