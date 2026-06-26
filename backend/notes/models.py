from django.conf import settings
from django.db import models

# Default categories seeded for every new user. Colors are the card/background
# hex values from the Figma mockups (exact values verified via Figma MCP).
DEFAULT_CATEGORIES = [
    {"name": "Random Thoughts", "color": "#F3C9A6"},
    {"name": "School", "color": "#F7E3B3"},
    {"name": "Personal", "color": "#A9D7C9"},
]


class Category(models.Model):
    """A user-scoped note category with an associated display color."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7)  # hex string, e.g. "#F3C9A6"
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"], name="unique_category_name_per_user"
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.user})"


def seed_default_categories(user):
    """Create the default set of categories for a freshly registered user."""
    return Category.objects.bulk_create(
        [
            Category(
                user=user,
                name=item["name"],
                color=item["color"],
                is_default=True,
            )
            for item in DEFAULT_CATEGORIES
        ]
    )
