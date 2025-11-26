# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404

from backend.cancer_diagnosis_database.database.models import Patient


@api_view(["GET"])
def index(request):
    """Simple API root for `/` during development."""
    return Response({"status": "ok", "message": "API root"}, status=status.HTTP_200_OK)

#PATIENTS

@api_view(["POST"])
def create_patient(request):
    data = request.data #makes it easier to call
    patient = Patient.objects.create(
    first_name = data['first_name'],
    last_name = data['last_name'],
    city_of_residence = data['city_of_residence'],
    date_of_birth = data['date_of_birth'],
    sex = data['sex'],
    )
    return Response(
        {"id": patient.id, "message": "Patient successfully created." },
        status=status.HTTP_201_CREATED,
    )

#get the list of data for each patient
@api_view(["GET"])
def get_patients(request):
    patients = list(Patient.objects.values())

    return Response(
        {"patient": patients},
        status=status.HTTP_200_OK      
    )

#get data for a patient given id
@api_view(["GET"])
def get_patient(request, id):
    try:
        patient = Patient.objects.values().get(id=id)
    except Patient.DoesNotExist:
        return Response(
        {"error: patient not found"},
        status=status.HTTP_404_NOT_FOUND
    )
    return Response(
        {"patient":patient},
        status=status.HTTP_200_OK
    )

#Update patient
@api_view(["PUT"])
def update_patient(request, id):
    try:
        patient = Patient.objects.get(id=id)
    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data

    # Update fields if provided
    patient.first_name = data.get('first_name', patient.first_name)
    patient.last_name = data.get('last_name', patient.last_name)
    patient.city_of_residence = data.get('city_of_residence', patient.city_of_residence)
    patient.date_of_birth = data.get('date_of_birth', patient.date_of_birth)
    patient.sex = data.get('sex', patient.sex)

    patient.save()

    return Response(
        {"id": patient.id, "message": "Patient successfully updated."},
        status=status.HTTP_200_OK
    )

#Delete patient
@api_view(["GET"])
def del_patient(request, id):
    try:
        patient = Patient.objects.get(id=id)
    except Patient.DoesNotExist:
        return Response(
        {"error": "patient not found"},
        status=status.HTTP_404_NOT_FOUND
    )

    patient.delete()

    return Response(
        {"message": f"Patient {id} successfully deleted."},
        status=status.HTTP_200_OK
    )

#DOCTORS

@api_view(["POST"])
def create_doctor(request):
    data = request.data
    doctor = doctor.objects.create(
        first_name=data['first_name'],
        last_name=data['last_name'],
        specialty=data['specialty'],
        city_of_practice=data.get('city_of_practice', '')
    )
    return Response(
        {"id": doctor.id, "message": "Doctor successfully created."},
        status=status.HTTP_201_CREATED
    )

@api_view(["GET"])
def get_doctors(request):
    doctors = list(doctors.objects.values())
    return Response({"doctors": doctors}, status=status.HTTP_200_OK)

@api_view(["GET"])
def get_doctor(request, id):
    try:
        doctor = doctor.objects.values().get(id=id)
    except doctor.DoesNotExist:
        return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"doctor": doctor}, status=status.HTTP_200_OK)

@api_view(["PUT"])
def update_doctor(request, id):
    try:
        doctor = doctor.objects.get(id=id)
    except doctor.DoesNotExist:
        return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    doctor.first_name = data.get('first_name', doctor.first_name)
    doctor.last_name = data.get('last_name', doctor.last_name)
    doctor.specialty = data.get('specialty', doctor.specialty)
    doctor.city_of_practice = data.get('city_of_practice', doctor.city_of_practice)
    doctor.save()

    return Response({"id": doctor.id, "message": "Doctor successfully updated."}, status=status.HTTP_200_OK)

@api_view(["GET"])
def delete_doctor(request, id):
    try:
        doctor = doctor.objects.get(id=id)
    except doctor.DoesNotExist:
        return Response({"error": "Doctor not found."}, status=status.HTTP_404_NOT_FOUND)

    doctor.delete()
    return Response({"message": f"Doctor {id} successfully deleted."}, status=status.HTTP_200_OK)