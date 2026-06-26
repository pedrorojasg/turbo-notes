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


def first_category(user):
    return Category.objects.filter(user=user).order_by("id").first()


class NoteCreateTests(APITestCase):
    def setUp(self):
        self.user = make_user("notes@example.com")
        self.client.force_authenticate(user=self.user)
        self.category = first_category(self.user)
        self.url = reverse("note-list")

    def test_create_note_returns_201(self):
        resp = self.client.post(
            self.url,
            {"title": "Hello", "content": "World", "category_id": self.category.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["title"], "Hello")
        self.assertEqual(resp.data["category_id"], self.category.id)
        self.assertEqual(resp.data["category_color"], self.category.color)

    def test_create_note_with_blank_title_allowed(self):
        resp = self.client.post(
            self.url,
            {"title": "", "content": "", "category_id": self.category.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_requires_authentication(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(
            self.url,
            {"title": "X", "content": "Y", "category_id": self.category.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_category_must_belong_to_user(self):
        other = make_user("other2@example.com")
        other_cat = first_category(other)
        resp = self.client.post(
            self.url,
            {"title": "X", "content": "Y", "category_id": other_cat.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class NoteReadTests(APITestCase):
    def setUp(self):
        self.user = make_user("read@example.com")
        self.client.force_authenticate(user=self.user)
        self.category = first_category(self.user)
        self.note = Note.objects.create(
            user=self.user, category=self.category, title="My Note", content="Body"
        )

    def test_list_returns_own_notes_only(self):
        other = make_user("other3@example.com")
        Note.objects.create(
            user=other,
            category=first_category(other),
            title="Secret",
            content="x",
        )
        resp = self.client.get(reverse("note-list"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["title"], "My Note")

    def test_retrieve_own_note(self):
        resp = self.client.get(reverse("note-detail", args=[self.note.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["title"], "My Note")

    def test_retrieve_other_users_note_returns_404(self):
        other = make_user("other4@example.com")
        other_note = Note.objects.create(
            user=other,
            category=first_category(other),
            title="Private",
            content="x",
        )
        resp = self.client.get(reverse("note-detail", args=[other_note.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class NoteUpdateTests(APITestCase):
    def setUp(self):
        self.user = make_user("update@example.com")
        self.client.force_authenticate(user=self.user)
        self.category = first_category(self.user)
        self.note = Note.objects.create(
            user=self.user, category=self.category, title="Old", content="Old body"
        )

    def test_patch_updates_title_and_content(self):
        resp = self.client.patch(
            reverse("note-detail", args=[self.note.id]),
            {"title": "New title"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["title"], "New title")

    def test_patch_updates_updated_at(self):
        old_ts = self.note.updated_at
        self.client.patch(
            reverse("note-detail", args=[self.note.id]),
            {"content": "changed"},
            format="json",
        )
        self.note.refresh_from_db()
        self.assertGreaterEqual(self.note.updated_at, old_ts)

    def test_patch_other_users_note_returns_404(self):
        other = make_user("other5@example.com")
        other_note = Note.objects.create(
            user=other,
            category=first_category(other),
            title="Theirs",
            content="x",
        )
        resp = self.client.patch(
            reverse("note-detail", args=[other_note.id]),
            {"title": "Stolen"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class NoteDeleteTests(APITestCase):
    def setUp(self):
        self.user = make_user("delete@example.com")
        self.client.force_authenticate(user=self.user)
        self.category = first_category(self.user)
        self.note = Note.objects.create(
            user=self.user, category=self.category, title="Gone", content=""
        )

    def test_delete_own_note(self):
        resp = self.client.delete(reverse("note-detail", args=[self.note.id]))
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=self.note.id).exists())

    def test_delete_other_users_note_returns_404(self):
        other = make_user("other6@example.com")
        other_note = Note.objects.create(
            user=other,
            category=first_category(other),
            title="Theirs",
            content="x",
        )
        resp = self.client.delete(reverse("note-detail", args=[other_note.id]))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(id=other_note.id).exists())


class NoteCategoryFilterTests(APITestCase):
    def setUp(self):
        self.user = make_user("filter@example.com")
        self.client.force_authenticate(user=self.user)
        cats = list(Category.objects.filter(user=self.user).order_by("id"))
        self.cat_a, self.cat_b = cats[0], cats[1]
        Note.objects.create(user=self.user, category=self.cat_a, title="A1", content="")
        Note.objects.create(user=self.user, category=self.cat_a, title="A2", content="")
        Note.objects.create(user=self.user, category=self.cat_b, title="B1", content="")

    def test_filter_by_category_returns_only_matching_notes(self):
        resp = self.client.get(reverse("note-list"), {"category": self.cat_a.id})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)
        for note in resp.data:
            self.assertEqual(note["category_id"], self.cat_a.id)

    def test_no_filter_returns_all_notes(self):
        resp = self.client.get(reverse("note-list"))
        self.assertEqual(len(resp.data), 3)

    def test_filter_by_other_users_category_returns_empty(self):
        other = make_user("other7@example.com")
        other_cat = first_category(other)
        resp = self.client.get(reverse("note-list"), {"category": other_cat.id})
        self.assertEqual(len(resp.data), 0)
