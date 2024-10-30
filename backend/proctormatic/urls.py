from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="Proctormatic API",
        default_version='v1',
        description="Proctormatic API입니다.",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    url='https://k11s209.p.ssafy.io'
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('accounts.urls')),
    path('coin/', include('coins.urls')),
    path('exam/', include('exams.urls')),
    path('helpdesk/', include('helpdesks.urls')),
    path('taker/', include('takers.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
