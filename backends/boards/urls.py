from django.urls import path
from .views import BoardListCreateView
from .views import WorkspaceListCreateView

urlpatterns = [
    path('workspaces/', WorkspaceListCreateView.as_view()),
    path('workspaces/<int:workspace_id>/boards/', BoardListCreateView.as_view()),
]
