from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from notes.models import DEFAULT_CATEGORIES, Category

User = get_user_model()

STRONG_PASSWORD = "Str0ng-Pass!23"


class CategorySeedingTests(APITestCase):
    def test_registration_seeds_three_default_categories(self):
        self.client.post(
            reverse("register"),
            {"email": "seed@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        user = User.objects.get(email="seed@example.com")
        categories = Category.objects.filter(user=user)

        self.assertEqual(categories.count(), len(DEFAULT_CATEGORIES))
        self.assertEqual(
            set(categories.values_list("name", flat=True)),
            {item["name"] for item in DEFAULT_CATEGORIES},
        )
        self.assertTrue(all(c.is_default for c in categories))

    def test_seeded_categories_have_expected_colors(self):
        self.client.post(
            reverse("register"),
            {"email": "colors@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        user = User.objects.get(email="colors@example.com")
        by_name = {c.name: c.color for c in Category.objects.filter(user=user)}
        for item in DEFAULT_CATEGORIES:
            self.assertEqual(by_name[item["name"]], item["color"])

    def test_categories_are_scoped_per_user(self):
        for email in ("a@example.com", "b@example.com"):
            self.client.post(
                reverse("register"),
                {"email": email, "password": STRONG_PASSWORD},
                format="json",
            )
        # Each user gets their own independent set of defaults.
        self.assertEqual(Category.objects.count(), 2 * len(DEFAULT_CATEGORIES))
