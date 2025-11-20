# Create your views here.
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404

#example
'''
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_task_progress_for_room(request,  room_id):
    """
    get_task_progress_for_room: Retrieves task progress for all tasks in a room.

    @param request: HTTP request object.
    @param course_id: ID of the parent course.
    @param section_id: ID of the parent section.
    @param room_id: ID of the room.
    @return:
        * HTTP 200: List of task progress data.
        * HTTP 403: If user lacks permission to view the room.
        * HTTP 404: If the room does not exist.
    @note:
        Checks room access, gets all task IDs in the room, and returns
        ProgressOfTask entries for the current user matching those task IDs.
    """
    # Check if room exists and user has access
    room = get_object_or_404(Room, id=room_id)
    
    if not user_has_access(room, request.user, edit=False):
        raise PermissionDenied("You do not have permission to view this room.")
    
    # Get list of task IDs for all tasks in room
    task_ids = list(room.tasks.values_list('id', flat=True))
    
    # Get ProgressOfTask entries for user where task is in the task_ids list
    progress_entries = ProgressOfTask.objects.filter(
        user=request.user,
        task_id__in=task_ids
    )
    
    # Serialize and return the data
    serializer = ProgressOfTaskSerializer(progress_entries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


'''