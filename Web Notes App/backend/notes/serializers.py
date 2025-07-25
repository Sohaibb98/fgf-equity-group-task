from rest_framework import serializers

from notes.models import Notes

class NotesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Notes
        fields = ['id', 'title', 'details', 'date']