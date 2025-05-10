# core_api/serializers.py
from rest_framework import serializers
from .models import User, Batch, DiscussionType, Schedule, UploadedFile

# from django.contrib.auth.hashers import make_password # Not used for user creation via API


class SimpleUserSerializer(serializers.ModelSerializer):
    batch_id = serializers.IntegerField(
        source="batch.id", read_only=True, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "role",
            "batch_id",
            "is_staff",
            "is_superuser",
        ]  # Added is_superuser


class UserSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(
        source="batch.name", read_only=True, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "batch",
            "batch_name",
            "is_staff",
            "is_superuser",
        ]  # Added is_superuser
        read_only_fields = ["username", "role", "batch", "is_staff", "is_superuser"]


class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = "__all__"


class DiscussionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionType
        fields = "__all__"


class ScheduleSerializer(serializers.ModelSerializer):
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    discussion_type_name = serializers.CharField(
        source="discussion_type.name", read_only=True
    )
    # Provide presenter's username for fallback display; full object lookup on frontend for formatting
    presenter_username = serializers.CharField(
        source="presenter.username", read_only=True, allow_null=True
    )
    # presenter_details = SimpleUserSerializer(source='presenter', read_only=True) # Alternative: embed SimpleUser
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True, allow_null=True
    )
    is_submission_uploaded = serializers.BooleanField(
        read_only=True
    )  # From model property

    class Meta:
        model = Schedule
        fields = [
            "id",
            "batch",
            "batch_name",
            "discussion_type",
            "discussion_type_name",
            "title",
            "presenter",  # Foreign key ID
            "presenter_username",  # Username for fallback
            # 'presenter_details', # If using embedded serializer
            "scheduled_date",
            "created_by",
            "created_by_username",
            "description",
            "is_submission_uploaded",
        ]


class UploadedFileSerializer(serializers.ModelSerializer):
    uploader_username = serializers.CharField(
        source="uploader.username", read_only=True
    )
    # uploader_details = SimpleUserSerializer(source='uploader', read_only=True) # Alternative
    batch_name = serializers.CharField(source="batch.name", read_only=True)
    discussion_type_name = serializers.CharField(
        source="discussion_type.name", read_only=True
    )
    schedule_title = serializers.CharField(
        source="schedule.title", read_only=True, allow_null=True
    )
    file_url = serializers.URLField(source="file.url", read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "uploader",  # ID
            "uploader_username",
            # 'uploader_details', # If using embedded serializer
            "batch",
            "batch_name",
            "discussion_type",
            "discussion_type_name",
            "schedule",
            "schedule_title",
            "file",
            "file_url",
            "original_filename",
            "upload_date",
            "description",
        ]
        read_only_fields = [
            "uploader",
            "uploader_username",
            "batch_name",
            "discussion_type_name",
            "schedule_title",
            "file_url",
            "original_filename",
            "upload_date",
        ]

    def create(self, validated_data):
        # uploader set in view, original_filename in model
        return super().create(validated_data)
