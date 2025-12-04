from django.urls import path
from . import views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)
urlpatterns = [
    # swagger ui for testing and documentaion
   path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # Patient
    path("create_patient", views.create_patient),
    path("get_patients", views.get_patients),
    path("get_patient/<int:patient_id>", views.get_patient),
    path("update_patient/<int:patient_id>", views.update_patient),
    path("delete_patient/<int:patient_id>", views.delete_patient),
    
    # Doctor
    path("create_doctor", views.create_doctor),
    path("get_doctors", views.get_doctors),
    path("get_doctor/<int:doctor_id>", views.get_doctor),
    path("update_doctor/<int:doctor_id>", views.update_doctor),
    path("delete_doctor/<int:doctor_id>", views.delete_doctor),
  
    # Cancer
    path("create_cancer", views.create_cancer),
    path("get_cancers", views.get_cancers),
    path("get_cancer/<int:cancer_id>", views.get_cancer),
    path("update_cancer/<int:cancer_id>", views.update_cancer),
    path("delete_cancer/<int:cancer_id>", views.delete_cancer),

    #TREATMENT
    path("create_treatment", views.create_treatment),
    path("get_treatments", views.get_treatments),
    path("get_treatment/<int:treatment_id>", views.get_treatment),
    path("update_treatment/<int:treatment_id>", views.update_treatment),
    path("delete_treatment/<int:treatment_id>", views.delete_treatment),

    #CANCER TREATMENT
    path("add_cancerTreatment", views.create_cancerTreatment),
    path("get_cancerTreatments", views.get_cancerTreatments),
    path("update_cancerTreatment/<int:cancerTreatment_id>", views.update_cancerTreatment),

    # EVALUATION
    path("create_evaluation", views.create_evaluation),
    path("get_evaluations", views.get_evaluations),
    path("remove_evaluation/<int:evaluation_id>", views.remove_evaluation),

    #DIAGNOSIS
    path("create_diagnosis", views.create_diagnosis),
    path("get_diagnoses", views.get_diagnoses),
    path("remove_diagnosis/<int:diagnosis_id>", views.remove_diagnosis),
]