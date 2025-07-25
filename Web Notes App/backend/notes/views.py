from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets

from notes.models import Notes
from notes.serializers import NotesSerializer


class NotesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows notes to be viewed or edited.
    """
    queryset = Notes.objects.all().order_by('-date')
    serializer_class = NotesSerializer
    permission_classes = [permissions.AllowAny]
