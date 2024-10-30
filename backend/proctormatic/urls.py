from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.urls import re_path

schema_view = get_schema_view(
    openapi.Info(
        title="Proctormatic API",
        default_version='v1',
        description="Proctormatic API입니다.",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# swagger_settings = {
#     'SECURITY_DEFINITIONS': {
#         'Bearer': {
#             'type': 'apiKey',
#             'in': 'header',
#             'name': 'Authorization',
#         }
#     }
# }

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/users/', include('accounts.urls')),
    path('api/coin/', include('coins.urls')),
    path('api/exam/', include('exams.urls')),
    path('api/helpdesk/', include('helpdesks.urls')),
    path('api/taker/', include('takers.urls')),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
