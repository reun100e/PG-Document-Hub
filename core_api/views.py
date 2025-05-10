from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.db.models import Q
from django.http import (
    FileResponse,
    Http404,
    HttpResponseForbidden,
)  # For download view
from django.shortcuts import get_object_or_404  # For download view
from urllib.parse import quote  # For filename encoding in download view
import os  # For download view if needed for basename

from rest_framework.exceptions import ValidationError as DRFValidationError

from .models import User, Batch, DiscussionType, Schedule, UploadedFile

# It's good practice to import specific serializers if you know them,
# or just 'from . import serializers' and use 'serializers.UserSerializer'
# Your current selective import is fine.
from .serializers import (
    UserSerializer,
    SimpleUserSerializer,
    BatchSerializer,
    DiscussionTypeSerializer,
    ScheduleSerializer,
    UploadedFileSerializer,
)
from .permissions import (
    IsStaffOrReadOnly,
    CanUploadFile,
    FileObjectPermissions,
    IsStaffUser,
)


class UsernamesListView(generics.ListAPIView):
    queryset = User.objects.filter(is_active=True, is_superuser=False).order_by(
        "username"
    )
    serializer_class = SimpleUserSerializer
    permission_classes = [permissions.AllowAny]


class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # The serializer_class is inherited from ObtainAuthToken (AuthTokenSerializer)
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except DRFValidationError as e:  # Use the correctly imported DRFValidationError
            error_detail_list = e.detail.get("non_field_errors", [])
            error_message = "Invalid username or password."  # Default
            if error_detail_list and error_detail_list[0]:
                error_message = str(error_detail_list[0])
            return Response(
                {"detail": error_message}, status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(
            user, context={"request": request}
        ).data  # Use your UserSerializer
        return Response({"token": token.key, "user": user_data})

    # REMOVED DUPLICATE POST METHOD THAT WAS HERE


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    # Default serializer, get_serializer_class will override for 'list'
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return SimpleUserSerializer  # Use lighter serializer for lists
        return UserSerializer  # For 'me' (retrieve on self) and admin retrieving specific user

    def get_queryset(self):
        # Default to active non-superusers
        queryset = User.objects.filter(is_active=True, is_superuser=False)

        # Filters from query parameters
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)

        batch_id = self.request.query_params.get("batch")
        if batch_id:
            try:
                queryset = queryset.filter(batch_id=int(batch_id))
            except ValueError:
                queryset = User.objects.none()

        roles_in = self.request.query_params.get("role__in")
        if roles_in:
            queryset = queryset.filter(role__in=roles_in.split(","))

        # Allow superuser to see superusers if they explicitly ask (example, not strictly needed now)
        # if self.request.user.is_superuser and self.request.query_params.get('include_all_users') == 'true':
        #     queryset = User.objects.filter(is_active=True)

        return queryset.order_by("username")

    def get_permissions(self):
        if self.action == "me":
            self.permission_classes = [permissions.IsAuthenticated]
        else:  # For 'list' and 'retrieve' actions
            self.permission_classes = [
                IsStaffUser
            ]  # Only staff can list/retrieve other users
        return super().get_permissions()

    @action(detail=False, methods=["get"], url_path="me", url_name="me")
    def me(self, request):
        # Uses UserSerializer by default due to self.serializer_class
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class PresenterCandidatesListView(generics.ListAPIView):
    serializer_class = SimpleUserSerializer
    permission_classes = [IsStaffUser]  # Only staff (Prof, BL, Admin) should fetch this

    def get_queryset(self):
        queryset = User.objects.filter(
            is_active=True, role="student", is_superuser=False
        )
        requesting_user = (
            self.request.user
        )  # This user is staff due to permission_classes

        batch_id_param = self.request.query_params.get(
            "batchId"
        ) or self.request.query_params.get(
            "batch_id"
        )  # Allow both param names

        if batch_id_param:
            try:
                batch_id = int(batch_id_param)
                queryset = queryset.filter(batch_id=batch_id)
                # If batch_leader is requesting, they must request for their own batch if batch_id is specified
                if requesting_user.role == "batch_leader" and requesting_user.batch:
                    if batch_id != requesting_user.batch.id:
                        return (
                            User.objects.none()
                        )  # Batch leader cannot query other batches
            except ValueError:
                return User.objects.none()
        elif requesting_user.role == "batch_leader":
            # If batch_leader makes a request without batch_id, scope to their own batch
            if requesting_user.batch:
                queryset = queryset.filter(batch=requesting_user.batch)
            else:
                return User.objects.none()  # Batch leader not assigned to a batch
        # Professors/Admins without batch_id param get all students

        return queryset.order_by("username")


class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.filter(is_active=True).order_by("name")
    serializer_class = BatchSerializer
    permission_classes = [IsStaffOrReadOnly]


class DiscussionTypeViewSet(viewsets.ModelViewSet):
    queryset = DiscussionType.objects.all().order_by("name")
    serializer_class = DiscussionTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


class ScheduleViewSet(viewsets.ModelViewSet):
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = (
            Schedule.objects.select_related(
                "batch", "discussion_type", "presenter", "created_by"
            )
            .prefetch_related("files")
            .all()
        )

        batch_id_param = self.request.query_params.get("batch_id")
        if batch_id_param:
            try:
                queryset = queryset.filter(batch_id=int(batch_id_param))
            except ValueError:
                queryset = queryset.none()

        presenter_id_param = self.request.query_params.get(
            "presenterId"
        ) or self.request.query_params.get("presenter")
        if presenter_id_param:
            try:
                queryset = queryset.filter(presenter_id=int(presenter_id_param))
            except ValueError:
                queryset = queryset.none()

        # Apply role-based visibility
        if user.is_staff:
            if user.role == "batch_leader" and user.batch:
                # Batch leader is already filtered to their batch for schedule management
                # If batch_id_param is given and it's not their batch, result is empty (correct)
                return queryset.filter(batch=user.batch).order_by("-scheduled_date")
            return queryset.order_by("-scheduled_date")  # Admin/Professor

        if user.role == "student":
            base_filter = Q()
            if user.batch:
                base_filter |= Q(batch=user.batch)  # Schedules in their batch
            base_filter |= Q(presenter=user)  # Schedules they present
            return queryset.filter(base_filter).distinct().order_by("-scheduled_date")

        return queryset.none()

    def get_permissions(self):
        class IsStaffAndCorrectBatchLeaderForSchedule(permissions.BasePermission):
            def has_object_permission(
                self, request, view, obj
            ):  # obj is a Schedule instance
                if not request.user.is_staff:
                    return False
                if request.user.role == "batch_leader":
                    return (
                        obj.batch == request.user.batch
                    )  # Can only modify schedules of their own batch
                return True  # Professor/Admin can modify any

        if self.action in ["update", "partial_update", "destroy"]:
            return [IsStaffUser(), IsStaffAndCorrectBatchLeaderForSchedule()]
        if self.action == "create":
            return [IsStaffUser()]
        return [permissions.IsAuthenticated()]  # Read access

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "batch_leader":
            if not user.batch:
                raise DRFValidationError(
                    {"detail": "Batch leader is not assigned to a batch."},
                    code=status.HTTP_400_BAD_REQUEST,
                )
            if serializer.validated_data.get("batch") != user.batch:
                raise DRFValidationError(
                    {
                        "detail": "Batch leaders can only create schedules for their own batch."
                    },
                    code=status.HTTP_403_FORBIDDEN,
                )
        serializer.save(created_by=user)

    def perform_update(
        self, serializer
    ):  # Object permission already checked by IsStaffAndCorrectBatchLeaderForSchedule
        serializer.save()  # created_by should not change on update typically, or handle if it can


class UploadedFileViewSet(viewsets.ModelViewSet):
    serializer_class = UploadedFileSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = UploadedFile.objects.select_related(
            "uploader", "batch", "discussion_type", "schedule"
        ).all()

        # Apply query_param filters
        batch_id_param = self.request.query_params.get("batch_id")
        if batch_id_param:
            try:
                queryset = queryset.filter(batch_id=int(batch_id_param))
            except ValueError:
                queryset = queryset.none()
        dt_id_param = self.request.query_params.get("discussion_type_id")
        if dt_id_param:
            try:
                queryset = queryset.filter(discussion_type_id=int(dt_id_param))
            except ValueError:
                queryset = queryset.none()
        schedule_id_param = self.request.query_params.get("schedule_id")
        if schedule_id_param:
            try:
                queryset = queryset.filter(schedule_id=int(schedule_id_param))
            except ValueError:
                queryset = queryset.none()
        uploader_id_param = self.request.query_params.get("uploader_id")
        if uploader_id_param:
            try:
                queryset = queryset.filter(uploader_id=int(uploader_id_param))
            except ValueError:
                queryset = queryset.none()

        # Default ordering
        final_queryset = queryset.order_by("-upload_date")

        # Role-based visibility for LIST action (self.action == 'list' or None)
        if self.action == "list" or self.action is None:
            if user.is_staff:
                if user.role == "batch_leader" and user.batch:
                    return final_queryset.filter(batch=user.batch)
                return final_queryset  # Admin/Professor see all (potentially filtered by params)
            if user.role == "student":
                base_filter = Q(uploader=user)  # Always see their own uploads
                if user.batch:
                    base_filter |= Q(
                        batch=user.batch
                    )  # And files in their current batch
                return final_queryset.filter(base_filter).distinct()
            return final_queryset.none()  # Should not be reached

        return final_queryset  # For detail views, permissions handle access

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), CanUploadFile()]
        # FileObjectPermissions handles retrieve, update, partial_update, destroy
        # It also implicitly handles list by virtue of being applied, but get_queryset is primary for list scoping.
        return [permissions.IsAuthenticated(), FileObjectPermissions()]

    def perform_create(self, serializer):
        user = self.request.user
        batch_obj = serializer.validated_data.get(
            "batch"
        )  # batch_obj is a Batch instance
        schedule_obj = serializer.validated_data.get(
            "schedule"
        )  # schedule_obj is a Schedule instance

        if user.is_staff:
            if user.role == "batch_leader":
                if not user.batch:
                    raise DRFValidationError(
                        {"detail": "Batch leader is not assigned to a batch."},
                        code=status.HTTP_403_FORBIDDEN,
                    )
                if batch_obj != user.batch:
                    raise DRFValidationError(
                        {
                            "detail": "Batch Leaders can only upload files to their own batch."
                        },
                        code=status.HTTP_403_FORBIDDEN,
                    )
                if schedule_obj and schedule_obj.batch != user.batch:
                    raise DRFValidationError(
                        {
                            "detail": "The selected schedule does not belong to your batch."
                        },
                        code=status.HTTP_403_FORBIDDEN,
                    )
        elif user.role == "student":
            if not user.batch:
                raise DRFValidationError(
                    {
                        "detail": "You are not assigned to a batch and cannot upload files."
                    },
                    code=status.HTTP_403_FORBIDDEN,
                )
            if batch_obj != user.batch:
                raise DRFValidationError(
                    {"detail": "Students can only upload files to their own batch."},
                    code=status.HTTP_403_FORBIDDEN,
                )
            if schedule_obj:
                if schedule_obj.batch != user.batch:
                    raise DRFValidationError(
                        {
                            "detail": "The selected schedule does not belong to your batch."
                        },
                        code=status.HTTP_403_FORBIDDEN,
                    )
                if schedule_obj.presenter and schedule_obj.presenter != user:
                    raise DRFValidationError(
                        {
                            "detail": "You can only upload files for schedules you are presenting."
                        },
                        code=status.HTTP_403_FORBIDDEN,
                    )

        if schedule_obj:  # Common check for all roles if schedule is linked
            if batch_obj != schedule_obj.batch:
                raise DRFValidationError(
                    {"detail": "File's batch must match the schedule's batch."}
                )
            if (
                serializer.validated_data.get("discussion_type")
                != schedule_obj.discussion_type
            ):
                raise DRFValidationError(
                    {
                        "detail": "File's discussion type must match the schedule's discussion type."
                    }
                )
        serializer.save(uploader=user)


from django.http import FileResponse, Http404, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_uploaded_file(request, file_id):
    uploaded_file = get_object_or_404(UploadedFile, pk=file_id)
    user = request.user

    can_download = False
    if user.is_staff:
        if user.role == "batch_leader":
            can_download = uploaded_file.batch == user.batch
        else:
            can_download = True  # Admins, Professors
    elif user.role == "student":
        can_download = (
            uploaded_file.batch == user.batch or uploaded_file.uploader == user
        )

    if not can_download:
        return HttpResponseForbidden(
            "You do not have permission to download this file."
        )

    if not uploaded_file.file:
        raise Http404("File not found associated with this record.")

    try:
        # Use a try-except for file opening as well
        file_handle = uploaded_file.file.open("rb")
        response = FileResponse(
            file_handle, as_attachment=True, filename=uploaded_file.original_filename
        )

        # Optional: More robust filename encoding for Content-Disposition
        try:
            uploaded_file.original_filename.encode("ascii")
            filename_header = 'filename="{}"'.format(uploaded_file.original_filename)
        except UnicodeEncodeError:
            filename_header = "filename*=UTF-8''{}".format(
                quote(uploaded_file.original_filename)
            )
        response["Content-Disposition"] = "attachment; {}".format(filename_header)

        return response
    except FileNotFoundError:
        raise Http404("File not found on the server's filesystem.")
    except Exception as e:
        print(f"Error serving file (ID: {file_id}): {e}")  # Log the actual error
        raise Http404("An error occurred while trying to serve the file.")
