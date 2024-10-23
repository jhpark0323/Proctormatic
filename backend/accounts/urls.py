from django.urls import path
from . import views

urlpatterns = [
    path('', views.chech_email_exists),
]