# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date, parse_datetime
from .models import (
    Patient,
    Doctor,
    Cancer,
    Treatment,
    CancerTreatment,
    Evaluate,
    Diagnosis,
)
from django.shortcuts import get_object_or_404


# PATIENTS-------------------------------------------------------------


@api_view(["POST"])
def create_patient(request):
    data = request.data  # makes it easier to call
    patient = Patient.objects.create(
        first_name=data["first_name"],
        last_name=data["last_name"],
        city_of_residence=data["city_of_residence"],
        date_of_birth=data["date_of_birth"],
        sex=data["sex"],
    )
    return Response(
        {"id": patient.id, "message": "Patient successfully created."},
        status=status.HTTP_201_CREATED,
    )


# get the list of data for each patient
@api_view(["GET"])
def get_patients(request):
    patients = list(Patient.objects.values())

    return Response({"patient": patients}, status=status.HTTP_200_OK)


# get data for a patient given id
@api_view(["GET"])
def get_patient(request, id):
    try:
        patient = Patient.objects.values().get(id=id)
    except Patient.DoesNotExist:
        return Response({"error: patient not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"patient": patient}, status=status.HTTP_200_OK)


# Update patient
@api_view(["PUT"])
def update_patient(request, id):
    try:
        patient = Patient.objects.get(id=id)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND
        )

    data = request.data

    # Update fields if provided
    patient.first_name = data.get("first_name", patient.first_name)
    patient.last_name = data.get("last_name", patient.last_name)
    patient.city_of_residence = data.get("city_of_residence", patient.city_of_residence)
    patient.date_of_birth = data.get("date_of_birth", patient.date_of_birth)
    patient.sex = data.get("sex", patient.sex)

    patient.save()

    return Response(
        {"id": patient.id, "message": "Patient successfully updated."},
        status=status.HTTP_200_OK,
    )


# Delete patient
@api_view(["GET"])
def delete_patient(request, id):
    try:
        patient = Patient.objects.get(id=id)
    except Patient.DoesNotExist:
        return Response(
            {"error": "patient not found"}, status=status.HTTP_404_NOT_FOUND
        )

    patient.delete()

    return Response(
        {"message": f"Patient {id} successfully deleted."}, status=status.HTTP_200_OK
    )


# DOCTORS----------------------------------------------------------------


@api_view(["POST"])
def create_doctor(request):
    data = request.data
    doctor = Doctor.objects.create(
        first_name=data["first_name"],
        last_name=data["last_name"],
        specialty=data["specialty"],
        city_of_practice=data.get("city_of_practice", ""),
    )
    return Response(
        {"id": doctor.id, "message": "Doctor successfully created."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def get_doctors(request):
    doctors = list(Doctor.objects.values())
    return Response({"doctors": doctors}, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_doctor(request, id):
    try:
        doctor = Doctor.objects.values().get(id=id)
    except doctor.DoesNotExist:
        return Response(
            {"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND
        )
    return Response({"doctor": doctor}, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_doctor(request, id):
    try:
        doctor = doctor.objects.get(id=id)
    except doctor.DoesNotExist:
        return Response(
            {"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND
        )

    data = request.data
    doctor.first_name = data.get("first_name", doctor.first_name)
    doctor.last_name = data.get("last_name", doctor.last_name)
    doctor.specialty = data.get("specialty", doctor.specialty)
    doctor.city_of_practice = data.get("city_of_practice", doctor.city_of_practice)
    doctor.save()

    return Response(
        {"id": doctor.id, "message": "Doctor successfully updated."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def delete_doctor(request, id):
    try:
        doctor = doctor.objects.get(id=id)
    except doctor.DoesNotExist:
        return Response(
            {"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND
        )

    doctor.delete()
    return Response(
        {"message": f"Doctor {id} successfully deleted."}, status=status.HTTP_200_OK
    )


# -------------------- CANCER --------------------
@api_view(["POST"])
def create_cancer(request):
    """
    Create a new Cancer entry.

    Req type: POST
    URL: /create_cancer
    Request body:
        - name: str
        - description: str
        - symptoms: str (optional)
    Response:
        - id: int (newly created Cancer ID)
        - message: str
    """
    data = request.data
    cancer = Cancer.objects.create(
        name=data.get("name"),
        description=data.get("description"),
        symptoms=data.get("symptoms", ""),
    )
    return Response(
        {"id": cancer.id, "message": "Cancer created successfully."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def get_cancers(request):
    """
    Retrieve a list of all Cancers.

    Req type: GET
    URL: /get_cancers
    Response: list of cancer objects with fields:
        - id: int
        - name: str
        - description: str
        - symptoms: str
    """
    cancers = list(Cancer.objects.values())
    return Response(cancers, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_cancer(request, cancer_id):
    """
    Retrieve a specific Cancer by ID.

    Req type: GET
    URL: /get_cancer/{cancer_id}
    Response:
        - id: int
        - name: str
        - description: str
        - symptoms: str
    """
    cancer = get_object_or_404(Cancer, id=cancer_id)
    data = {
        "id": cancer.id,
        "name": cancer.name,
        "description": cancer.description,
        "symptoms": cancer.symptoms,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_cancer(request, cancer_id):
    """
    Update an existing Cancer entry.

    Req type: PUT
    URL: /update_cancer/{cancer_id}
    Request body:
        - name: str
        - description: str
        - symptoms: str (optional)
    Response:
        - message: str
    """
    cancer = get_object_or_404(Cancer, id=cancer_id)
    data = request.data
    cancer.name = data.get("name")
    cancer.description = data.get("description")
    cancer.symptoms = data.get("symptoms", "")
    cancer.save()
    return Response(
        {"message": "Cancer updated successfully."}, status=status.HTTP_200_OK
    )


@api_view(["DELETE"])
def delete_cancer(request, cancer_id):
    """
    Delete a Cancer entry by ID.

    Req type: DELETE
    URL: /delete_cancer/{cancer_id}
    Response:
        - message: str
    """
    cancer = get_object_or_404(Cancer, id=cancer_id)
    cancer.delete()
    return Response(
        {"message": "Cancer deleted successfully."}, status=status.HTTP_200_OK
    )


# -------------------- TREATMENT --------------------
@api_view(["POST"])
def create_treatment(request):
    """
    Create a new Treatment entry.

    Req type: POST
    URL: /create_treatment
    Request body:
        - name: str
        - description: str
    Response:
        - id: int (newly created Treatment ID)
        - message: str
    """
    data = request.data
    treatment = Treatment.objects.create(
        name=data.get("name"), description=data.get("description")
    )
    return Response(
        {"id": treatment.id, "message": "Treatment created successfully."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def get_treatments(request):
    """
    Retrieve a list of all Treatments.

    Req type: GET
    URL: /get_treatments
    Response: list of treatment objects with fields:
        - id: int
        - name: str
        - description: str
    """
    treatments = list(Treatment.objects.values())
    return Response(treatments, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_treatment(request, treatment_id):
    """
    Retrieve a specific Treatment by ID.

    Req type: GET
    URL: /get_treatment/{treatment_id}
    Response:
        - id: int
        - name: str
        - description: str
    """
    treatment = get_object_or_404(Treatment, id=treatment_id)
    data = {
        "id": treatment.id,
        "name": treatment.name,
        "description": treatment.description,
    }
    return Response(data, status=status.HTTP_200_OK)


@api_view(["PUT"])
def update_treatment(request, treatment_id):
    """
    Update an existing Treatment entry.

    Req type: PUT
    URL: /update_treatment/{treatment_id}
    Request body:
        - name: str
        - description: str
    Response:
        - message: str
    """
    treatment = get_object_or_404(Treatment, id=treatment_id)
    data = request.data
    treatment.name = data.get("name")
    treatment.description = data.get("description")
    treatment.save()
    return Response(
        {"message": "Treatment updated successfully."}, status=status.HTTP_200_OK
    )


@api_view(["DELETE"])
def delete_treatment(request, treatment_id):
    """
    Delete a Treatment entry by ID.

    Req type: DELETE
    URL: /delete_treatment/{treatment_id}
    Response:
        - message: str
    """
    treatment = get_object_or_404(Treatment, id=treatment_id)
    treatment.delete()
    return Response(
        {"message": "Treatment deleted successfully."}, status=status.HTTP_200_OK
    )


# -------------------- CANCER TREATMENT --------------------
@api_view(["POST"])
def create_cancerTreatment(request):
    """
    Add a Treatment to a Diagnosis.

    Req type: POST
    URL: /add_cancerTreatment
    Request body:
        - diagnosis_id: int
        - treatment_id: int
        - current_status: "I", "P", "C"
        - end_date: str (datetime)
    Response:
        - id: int
        - message: str
    """
    data = request.data
    diagnosis = get_object_or_404(Diagnosis, id=data.get("diagnosis_id"))
    treatment = get_object_or_404(Treatment, id=data.get("treatment_id"))
    treat = CancerTreatment.objects.create(
        diagnosis=diagnosis,
        treatment=treatment,
        current_status=data.get("current_status"),
        end_date=parse_datetime(data.get("end_date")),
    )
    return Response(
        {"id": treat.id, "message": "Cancer treatment created."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT"])
def update_cancerTreatment(request, cancerTreatment_id):
    """
    Update a Cancer Treatment entry.

    Req type: PUT
    URL: /update_cancerTreatment/{cancerTreatment_id}
    Request body:
        - diagnosis_id: int
        - treatment_id: int
        - current_status: "I", "P", "C"
        - end_date: str (datetime)
    Response:
        - message: str
    """
    treat = get_object_or_404(CancerTreatment, id=cancerTreatment_id)
    data = request.data
    treat.diagnosis = get_object_or_404(Diagnosis, id=data.get("diagnosis_id"))
    treat.treatment = get_object_or_404(Treatment, id=data.get("treatment_id"))
    treat.current_status = data.get("current_status")
    treat.end_date = parse_datetime(data.get("end_date"))
    treat.save()
    return Response({"message": "Cancer treatment updated."}, status=status.HTTP_200_OK)


# -------------------- EVALUATION --------------------
@api_view(["POST"])
def create_evaluation(request):
    """
    Create a new Evaluation linking a Doctor to a Patient.

    Req type: POST
    URL: /create_evaluation
    Request body:
        - doctor_id: int
        - patient_id: int
    Response:
        - id: int (newly created Evaluation ID)
        - message: str
    """
    data = request.data
    doctor = get_object_or_404(Doctor, id=data.get("doctor_id"))
    patient = get_object_or_404(Patient, id=data.get("patient_id"))
    evaluation = Evaluate.objects.create(doctor=doctor, patient=patient)
    return Response(
        {"id": evaluation.id, "message": "Evaluation created."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def remove_evaluation(request, evaluation_id):
    """
    Remove an Evaluation entry by ID.

    Req type: GET
    URL: /remove_evaluation/{evaluation_id}
    Response:
        - message: str
    """
    evaluation = get_object_or_404(Evaluate, id=evaluation_id)
    evaluation.delete()
    return Response({"message": "Evaluation removed."}, status=status.HTTP_200_OK)


# -------------------- CANCER TREATMENT --------------------
@api_view(["POST"])
def create_cancerTreatment(request):
    """
    Add a Treatment to a Diagnosis (Cancer Treatment entry).

    Req type: POST
    URL: /add_cancerTreatment
    Request body:
        - diagnosis_id: int
        - treatment_id: int
        - current_status: "I", "P", "C"
        - end_date: str (datetime, optional)
    Response:
        - id: int (newly created CancerTreatment ID)
        - message: str
    """
    data = request.data
    diagnosis = get_object_or_404(Diagnosis, id=data.get("diagnosis_id"))
    treatment = get_object_or_404(Treatment, id=data.get("treatment_id"))
    treat = CancerTreatment.objects.create(
        diagnosis=diagnosis,
        treatment=treatment,
        current_status=data.get("current_status"),
        end_date=parse_datetime(data.get("end_date")) if data.get("end_date") else None,
    )
    return Response(
        {"id": treat.id, "message": "Cancer treatment created."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT"])
def update_cancerTreatment(request, cancerTreatment_id):
    """
    Update an existing Cancer Treatment entry.

    Req type: PUT
    URL: /update_cancerTreatment/{cancerTreatment_id}
    Request body:
        - diagnosis_id: int
        - treatment_id: int
        - current_status: "I", "P", "C"
        - end_date: str (datetime, optional)
    Response:
        - message: str
    """
    treat = get_object_or_404(CancerTreatment, id=cancerTreatment_id)
    data = request.data
    treat.diagnosis = get_object_or_404(Diagnosis, id=data.get("diagnosis_id"))
    treat.treatment = get_object_or_404(Treatment, id=data.get("treatment_id"))
    treat.current_status = data.get("current_status")
    treat.end_date = (
        parse_datetime(data.get("end_date")) if data.get("end_date") else None
    )
    treat.save()
    return Response({"message": "Cancer treatment updated."}, status=status.HTTP_200_OK)
    # -------------------- DIAGNOSIS --------------------


@api_view(["POST"])
def create_diagnosis(request):
    """
    Create a new Diagnosis linking a Patient to a Cancer.

    Req type: POST
    URL: /create_diagnosis
    Request body:
        - patient_id: int
        - cancer_id: int
    Response:
        - id: int (newly created Diagnosis ID)
        - message: str
    """
    data = request.data
    patient = get_object_or_404(Patient, id=data.get("patient_id"))
    cancer = get_object_or_404(Cancer, id=data.get("cancer_id"))
    diagnosis = Diagnosis.objects.create(patient=patient, cancer=cancer)
    return Response(
        {"id": diagnosis.id, "message": "Diagnosis created."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
def remove_diagnosis(request, diagnosis_id):
    """
    Remove a Diagnosis entry by ID.

    Req type: GET
    URL: /remove_diagnosis/{diagnosis_id}
    Response:
        - message: str
    """
    diagnosis = get_object_or_404(Diagnosis, id=diagnosis_id)
    diagnosis.delete()
    return Response({"message": "Diagnosis removed."}, status=status.HTTP_200_OK)
