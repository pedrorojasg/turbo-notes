from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "color", "is_default", "user"]
    list_filter = ["is_default"]
    search_fields = ["name", "user__email"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "user", "updated_at"]
    list_filter = ["category"]
    search_fields = ["title", "content", "user__email"]
