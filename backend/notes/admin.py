from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "color", "is_default", "user"]
    list_filter = ["is_default"]
    search_fields = ["name", "user__email"]
