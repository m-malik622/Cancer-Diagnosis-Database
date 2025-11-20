from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.db import transaction
from .models import (
    Badge,
    ProgressOfTask,
    Room,
    Course,
    Section,
    Status,
    Task,
    TaskComponent,
    Tag,
    VisibilityLevel,
    ProgressOfTask,
)

#example
'''
# -------------------------------
# TaskComponent Serializer
# -------------------------------
class TaskComponentSerializer(serializers.ModelSerializer):
    task_component_id = serializers.IntegerField(source="id", read_only=True)
    content = serializers.JSONField()

    class Meta:
        model = TaskComponent
        fields = ["task_component_id", "type", "content"]  # what is sent back
'''