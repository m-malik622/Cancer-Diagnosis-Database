from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
]

urlpatterns = [
    path("", views.Create_Patient, name="Create_Patient"),
]