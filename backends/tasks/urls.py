from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, TaskViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='projects')
router.register(r'tasks', TaskViewSet, basename='tasks')

urlpatterns = [
    path('', include(router.urls)),
]
