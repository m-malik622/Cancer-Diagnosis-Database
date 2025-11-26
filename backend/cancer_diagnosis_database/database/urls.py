from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
]

#Patient
urlpatterns = [
    path("create_catient", views.create_patient),
    path("get_patients/", views.get_patients),
    path("get_patients/<int:id>/", views.get_patient),
    path("update_patient/<int:id>/", views.update_patient),
    path("delete_patient/<int:id>/", views.delete_patient),      
]
#Doctor
urlpatterns = [
    path("create_doctor/", views.create_doctor),
    path("get_doctors/", views.get_doctors),
    path("get_doctor/<int:id>/", views.get_doctor),
    path("update_doctor/<int:id>/", views.update_doctor),
    path("delete_doctor/<int:id>/", views.delete_doctor),
]