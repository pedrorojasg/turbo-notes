from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

STRONG_PASSWORD = "Str0ng-Pass!23"


class RegisterTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")

    def test_register_creates_user_and_returns_tokens(self):
        resp = self.client.post(
            self.url,
            {"email": "new@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertEqual(resp.data["user"]["email"], "new@example.com")
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_register_does_not_return_password(self):
        resp = self.client.post(
            self.url,
            {"email": "new@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        self.assertNotIn("password", resp.data.get("user", {}))

    def test_duplicate_email_rejected(self):
        User.objects.create_user(email="dupe@example.com", password=STRONG_PASSWORD)
        resp = self.client.post(
            self.url,
            {"email": "dupe@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data)

    def test_weak_password_rejected(self):
        resp = self.client.post(
            self.url,
            {"email": "weak@example.com", "password": "123"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", resp.data)
        self.assertFalse(User.objects.filter(email="weak@example.com").exists())

    def test_invalid_email_rejected(self):
        resp = self.client.post(
            self.url,
            {"email": "not-an-email", "password": STRONG_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", resp.data)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", password=STRONG_PASSWORD
        )

    def test_login_returns_tokens(self):
        resp = self.client.post(
            reverse("login"),
            {"email": "user@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_login_with_bad_password_rejected(self):
        resp = self.client.post(
            reverse("login"),
            {"email": "user@example.com", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_returns_new_access_token(self):
        login = self.client.post(
            reverse("login"),
            {"email": "user@example.com", "password": STRONG_PASSWORD},
            format="json",
        )
        resp = self.client.post(
            reverse("refresh"),
            {"refresh": login.data["refresh"]},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)


class MeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="me@example.com", password=STRONG_PASSWORD
        )

    def test_me_requires_authentication(self):
        resp = self.client.get(reverse("me"))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get(reverse("me"))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["email"], "me@example.com")
