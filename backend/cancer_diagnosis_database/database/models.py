from django.db import models
from django.utils.translation import gettext_lazy as _


# Enums
class TreatmentStatus(models.TextChoices):
    INCOMPLETE = "I", _("INCOMPLETE")
    COMPLETE = "C", _("COMPLETE CURE")
    PARTIAL = "P", _("PARTIAL CURE")


class SexType(models.TextChoices):
    MALE = "M", _("MALE")
    FEMALE = "F", _("FEMALE")
    UNKNOWN = "U", _("UNKNOWN")


# Models
class Patient(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField(blank=True, null=True)
    sex = models.CharField(
        max_length=1, choices=SexType.choices, default=SexType.UNKNOWN
    )
    city_of_residence = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Doctor(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    specialty = models.CharField(max_length=100)
    city_of_practice = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Cancer(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)
    symptoms = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        trimmed = (
            self.description[:50] + "..."
            if len(self.description) > 50
            else self.description
        )
        return f"{self.name} - {trimmed}"


class Treatment(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=1000)

    def __str__(self):
        trimmed = (
            self.description[:50] + "..."
            if len(self.description) > 50
            else self.description
        )
        return f"{self.name} - {trimmed}"


# Relationship models
class Evaluate(models.Model):
    doctor = models.ForeignKey("Doctor", on_delete=models.CASCADE)
    patient = models.ForeignKey("Patient", on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["doctor", "patient"], name="unique_doctor_patient"
            )
        ]

    def __str__(self):
        return f"{self.doctor} evaluates {self.patient}"


class Diagnosis(models.Model):
    patient = models.ForeignKey("Patient", on_delete=models.CASCADE)
    cancer = models.ForeignKey("Cancer", on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["patient", "cancer"], name="unique_cancer_patient"
            )
        ]

    def __str__(self):
        return f"{self.patient} diagnosed with {self.cancer}"


class CancerTreatment(models.Model):
    diagnosis = models.ForeignKey("Diagnosis", on_delete=models.CASCADE)
    treatment = models.ForeignKey("Treatment", on_delete=models.CASCADE)
    start_date = models.DateTimeField(auto_now=True)
    current_status = models.CharField(
        max_length=1,
        choices=TreatmentStatus.choices,
        default=TreatmentStatus.INCOMPLETE,
    )
    end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["diagnosis", "treatment"], name="unique_diagnosis_treatment"
            )
        ]

    def __str__(self):
        return f"{self.diagnosis} -> {self.treatment}"
