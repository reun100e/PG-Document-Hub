from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet, basename="user")
router.register(r"batches", views.BatchViewSet, basename="batch")
router.register(
    r"discussion-types", views.DiscussionTypeViewSet, basename="discussiontype"
)
router.register(r"schedules", views.ScheduleViewSet, basename="schedule")
router.register(r"files", views.UploadedFileViewSet, basename="uploadedfile")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", views.CustomObtainAuthToken.as_view(), name="auth-login"),
    path(
        "auth/usernames/", views.UsernamesListView.as_view(), name="auth-usernames-list"
    ),
    path(
        "presenter-candidates/",
        views.PresenterCandidatesListView.as_view(),
        name="presenter-candidates-list",
    ),
    path(
        "download-file/<int:file_id>/",
        views.download_uploaded_file,
        name="download-uploaded-file",
    ),
]
