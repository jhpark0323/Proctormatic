"""
URL configuration for proctormatic project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_yasg.app_settings import swagger_settings
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
)

swagger_settings = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
        }
    }
}

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/users/', include('accounts.urls')),
    path('api/coin/', include('coins.urls')),
    path('api/exam/', include('exams.urls')),
    path('api/helpdesk/', include('helpdesks.urls')),
    path('api/taker/', include('takers.urls')),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
]
