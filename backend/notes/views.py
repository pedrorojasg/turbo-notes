from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer

from django.db.models import Count


class CategoryViewSet(
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """Read-only list of the current user's categories with note counts."""

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Category.objects.filter(user=self.request.user)
            .annotate(note_count=Count("notes"))
            .order_by("id")
        )


class NoteViewSet(viewsets.ModelViewSet):
    """Full CRUD for notes, scoped to the current user."""

    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = Note.objects.filter(user=self.request.user).select_related("category")
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)
