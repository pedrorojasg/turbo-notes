from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from notes.models import Category, Note, seed_default_categories

User = get_user_model()
STRONG_PASSWORD = "Str0ng-Pass!23"


def make_user(email):
    user = User.objects.create_user(email=email, password=STRONG_PASSWORD)
    seed_default_categories(user)
    return user


class CategoryListTests(APITestCase):
    def setUp(self):
        self.user = make_user("cat@example.com")
        self.client.force_authenticate(user=self.user)
        self.categories = list(Category.objects.filter(user=self.user))

    def test_returns_three_default_categories(self):
        resp = self.client.get(reverse("category-list"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 3)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get(reverse("category-list"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_note_count_is_zero_with_no_notes(self):
        resp = self.client.get(reverse("category-list"))
        for cat in resp.data:
            self.assertEqual(cat["note_count"], 0)

    def test_note_count_increments_correctly(self):
        cat = self.categories[0]
        Note.objects.create(user=self.user, category=cat, title="T", content="C")
        Note.objects.create(user=self.user, category=cat, title="T2", content="C2")
        resp = self.client.get(reverse("category-list"))
        result = {c["id"]: c["note_count"] for c in resp.data}
        self.assertEqual(result[cat.id], 2)

    def test_categories_not_leaked_across_users(self):
        other = make_user("other@example.com")
        self.client.force_authenticate(user=other)
        resp = self.client.get(reverse("category-list"))
        ids = {c["id"] for c in resp.data}
        self.assertTrue(ids.isdisjoint({c.id for c in self.categories}))
