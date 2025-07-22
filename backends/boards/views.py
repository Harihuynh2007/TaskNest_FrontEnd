# boards/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Board, Workspace
from .serializers import BoardSerializer
from .serializers import WorkspaceSerializer

class BoardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):
        try:
            workspace = Workspace.objects.get(id=workspace_id, owner=request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found'}, status=404)

        boards = Board.objects.filter(workspace=workspace)
        serializer = BoardSerializer(boards, many=True)
        return Response(serializer.data)

    def post(self, request, workspace_id):
        try:
            workspace = Workspace.objects.get(id=workspace_id, owner=request.user)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found'}, status=404)

        serializer = BoardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(workspace=workspace, created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class WorkspaceListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workspaces = Workspace.objects.filter(owner=request.user)
        serializer = WorkspaceSerializer(workspaces, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WorkspaceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)