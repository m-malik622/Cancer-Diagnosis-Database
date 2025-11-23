# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404


@api_view(["GET"])
def index(request):
    """Simple API root for `/` during development."""
    return Response({"status": "ok", "message": "API root"}, status=status.HTTP_200_OK)