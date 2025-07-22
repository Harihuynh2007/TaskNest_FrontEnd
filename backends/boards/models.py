# boards/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Workspace(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

class Board(models.Model):
    name = models.CharField(max_length=255)
    background = models.TextField(blank=True)
    visibility = models.CharField(max_length=20, default='private')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
