from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
import json
#example unit test (type we will be doign for task #4)
# Create your tests here.
class TestDatabase(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="TestingAdmin",
            email="admin@example.com",
            password="testingadminpass"
        )
        self.normal_user = User.objects.create_user(
            username="TestingUser",
            email="user@example.com",
            password="testinguserpass"
        )

    def test_create_patient(self):
        response = self.client.post("/create_patient", {
            "first_name": "John",
            "last_name": "Pork",
            "city_of_residence": "Astroworld",
            "date_of_birth": "2003-04-01",
            "sex": "M"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_nonexistent_patient(self):
        response = self.client.get("/get_patient/999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_patient(self):
        create_patient = self.client.post("/create_patient", {
            "first_name": "John",
            "last_name": "Pork",
            "city_of_residence": "Astroworld",
            "date_of_birth": "2003-04-01",
            "sex": "M"
        })

        patient_id = create_patient.json().get("id")
        self.assertIsNotNone(patient_id)

        response = self.client.get(f"/delete_patient/{patient_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # -------------------- DOCTOR + EVALUATION TESTS --------------------

    def test_evaluation_creation(self):
        # Create patient
        patient_resp = self.client.post("/create_patient", {
            "first_name": "John",
            "last_name": "Pork",
            "city_of_residence": "Astroworld",
            "date_of_birth": "2003-04-01",
            "sex": "M"
        })
        patient_id = patient_resp.json().get("id")

        # Create doctor
        doctor_resp = self.client.post("/create_doctor", {
            "first_name": "Joe",
            "last_name": "Biden",
            "specialty": "Cardiologist",
            "city_of_practice": "Astroworld"
        })
        doctor_id = doctor_resp.json().get("id")

        # Create evaluation
        eval_resp = self.client.post("/create_evaluation", {
            "doctor_id": doctor_id,
            "patient_id": patient_id
        })
        self.assertEqual(eval_resp.status_code, status.HTTP_201_CREATED)

    # -------------------- CANCER, TREATMENT, DIAGNOSIS, CANCERTREATMENT --------------------

    def test_full_cancer_flow(self):
        # Create cancer
        cancer_resp = self.client.post("/create_cancer", {
            "name": "Lung Cancer",
            "description": "Malignant tumor in lung tissue.",
            "symptoms": "Cough, chest pain"
        })
        cancer_id = cancer_resp.json().get("id")
        self.assertIsNotNone(cancer_id)

        # Create patient
        patient_resp = self.client.post("/create_patient", {
            "first_name": "Alice",
            "last_name": "Wonder",
            "city_of_residence": "Narnia",
            "date_of_birth": "1999-01-21",
            "sex": "F"
        })
        patient_id = patient_resp.json().get("id")

        # Diagnosis
        diag_resp = self.client.post("/create_diagnosis", {
            "patient_id": patient_id,
            "cancer_id": cancer_id
        })
        diagnosis_id = diag_resp.json().get("id")
        self.assertEqual(diag_resp.status_code, status.HTTP_201_CREATED)

        # Treatment
        treatment_resp = self.client.post("/create_treatment", {
            "name": "Chemotherapy",
            "description": "Chemical treatment"
        })
        treatment_id = treatment_resp.json().get("id")

        # Cancer Treatment Relation
        ct_resp = self.client.post("/add_cancerTreatment", {
            "diagnosis_id": diagnosis_id,
            "treatment_id": treatment_id,
            "current_status": "I",  # TreatmentStatus.INCOMPLETE
            "end_date": "2025-01-01T00:00:00Z"
        })
        self.assertEqual(ct_resp.status_code, status.HTTP_201_CREATED)
    