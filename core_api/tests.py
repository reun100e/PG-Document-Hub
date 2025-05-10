from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from .models import User, Batch, DiscussionType, Schedule, UploadedFile
from django.core.files.uploadedfile import (
    SimpleUploadedFile,
)  # For testing file uploads


class AuthTests(APITestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            "admin", "admin@example.com", "password123"
        )
        self.student_user = User.objects.create_user(
            "student1", "student1@example.com", "password123", role="student"
        )
        # You might create a Batch and assign the student to it here for more complex tests

    def test_login(self):
        url = reverse("auth-login")
        data = {"username": "student1", "password": "password123"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "student1")

    def test_login_fail(self):
        url = reverse("auth-login")
        data = {"username": "student1", "password": "wrongpassword"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_usernames_list(self):
        url = reverse("auth-usernames-list")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 2)  # admin and student1
        usernames = [item["username"] for item in response.data]
        self.assertIn("admin", usernames)
        self.assertIn("student1", usernames)

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.student_user)
        # Assuming your UserViewSet 'me' action is at '/api/users/me/'
        # router.register(r'users', views.UserViewSet, basename='user')
        # url 'user-me'
        url = reverse("user-me")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.student_user.username)

    def test_get_me_unauthenticated(self):
        url = reverse("user-me")
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FileUploadTests(APITestCase):
    def setUp(self):
        self.batch = Batch.objects.create(
            name="Test Batch 2024", start_year=2024, end_year=2027
        )
        self.dt = DiscussionType.objects.create(name="Test Discussion")
        self.student_user = User.objects.create_user(
            username="teststudent",
            password="password123",
            role="student",
            batch=self.batch,
        )
        self.client = APIClient()
        self.client.force_authenticate(
            user=self.student_user
        )  # Authenticate as student

        # Create a dummy file for upload
        self.test_file = SimpleUploadedFile(
            "test_document.pdf", b"file_content", content_type="application/pdf"
        )

    def test_student_can_upload_file_to_own_batch(self):
        url = reverse(
            "uploadedfile-list"
        )  # Assuming 'uploadedfile' is the basename for UploadedFileViewSet
        data = {
            "batch": self.batch.id,
            "discussion_type": self.dt.id,
            "description": "Test upload from student",
            "file": self.test_file,
        }
        response = self.client.post(
            url, data, format="multipart"
        )  # Use 'multipart' for file uploads

        if response.status_code != status.HTTP_201_CREATED:
            print("Upload Error:", response.data)  # Print error details if upload fails

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UploadedFile.objects.count(), 1)
        uploaded_file = UploadedFile.objects.first()
        self.assertEqual(uploaded_file.uploader, self.student_user)
        self.assertEqual(uploaded_file.batch, self.batch)
        self.assertTrue(
            uploaded_file.file.name.endswith("_test_document.pdf")
        )  # Check suffix due to path generation

    def test_student_cannot_upload_to_other_batch(self):
        other_batch = Batch.objects.create(
            name="Other Batch 2025", start_year=2025, end_year=2028
        )
        url = reverse("uploadedfile-list")
        data = {
            "batch": other_batch.id,  # Attempt to upload to a batch not assigned to student
            "discussion_type": self.dt.id,
            "description": "Test upload to other batch",
            "file": self.test_file,
        }
        response = self.client.post(url, data, format="multipart")
        self.assertEqual(
            response.status_code, status.HTTP_403_FORBIDDEN
        )  # Or 400 based on validation error
        self.assertEqual(UploadedFile.objects.count(), 0)


# Add more test classes for Batches, DiscussionTypes, Schedules, etc.
