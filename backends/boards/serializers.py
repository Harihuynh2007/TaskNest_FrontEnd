# boards/serializers.py
from rest_framework import serializers
from .models import Board
from .models import Workspace

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['id', 'name', 'workspace', 'created_by', 'background', 'visibility']
        read_only_fields = ['created_by', 'workspace']

class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['id', 'name']