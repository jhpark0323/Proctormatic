from django.urls import path
from . import views

urlpatterns = [
    path('', views.add_taker),
    path('id/card/', views.update_taker),
]
