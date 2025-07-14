from rest_framework import viewsets, permissions
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from .permissions import IsOwner
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            success = True,
            message = "Project created successfully!",
            data = serializer.data,
            status=201
        )
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        queryset = Task.objects.filter(project_owner= self.request.user)

        status = self.request.query_params.get('status')
        project_id = self.request.query_params.get('project')

        if status :
            queryset = queryset.filter(status=status)
        if project_id:
            queryset = queryset.filter(project_id = project_id)

        return queryset.order_by('-created_at')
            
    def perform_create(self, serializer):
        serializer.save()
