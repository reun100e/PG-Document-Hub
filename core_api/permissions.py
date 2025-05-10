from rest_framework import permissions
from .models import UploadedFile  # For type hinting


# This can be used for most write operations by staff
class IsStaffUser(permissions.BasePermission):
    """
    Allows access only to staff users.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to anyone, but only staff users for write operations.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


# Keep CanUploadFile and FileObjectPermissions as they contain role-specific logic beyond just is_staff,
# especially for students and object ownership.


class CanUploadFile(permissions.BasePermission):
    """
    General permission to check if a user can attempt an upload.
    More specific business logic is in the view.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class FileObjectPermissions(permissions.BasePermission):
    """
    - Staff (Admin, Professor, Batch Leader) have more privileges.
    - Student can view files in their batch, manage their own.
    """

    def has_permission(self, request, view):  # For LIST action
        # The queryset in UploadedFileViewSet.get_queryset already filters the list
        # based on user role. So, if a user is authenticated, they can attempt to list.
        # The queryset will be empty if they have no access to any files based on their role.
        return request.user and request.user.is_authenticated

    def has_object_permission(
        self, request, view, obj: UploadedFile
    ):  # For RETRIEVE, UPDATE, DELETE
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff users (Admin, Professor, Batch Leader)
        if request.user.is_staff:
            if request.user.is_superuser:  # Super Admins can do anything
                return True
            # Batch Leaders can manage files within their own batch
            if request.user.role == "batch_leader":
                return obj.batch == request.user.batch
            # Professors can manage (view, update, delete - as per current broad staff permission) any file
            if request.user.role == "professor":
                return True
            # Default for other staff (if any) might be view-only unless superuser
            # For now, professor and batch leader cover specific staff write actions.
            return request.method in permissions.SAFE_METHODS  # Other staff can view

        # Student permissions
        if request.user.role == "student":
            # Students can view files in their assigned batch OR files they uploaded themselves
            if request.method in permissions.SAFE_METHODS:
                # Student must be in a batch to view batch files, or it must be their own upload
                can_view_batch_file = (
                    obj.batch and request.user.batch and obj.batch == request.user.batch
                )
                is_own_upload = obj.uploader == request.user
                return can_view_batch_file or is_own_upload

            # Students can only modify/delete their own uploads
            if obj.uploader == request.user:
                return True  # Allows PATCH, PUT, DELETE for own files

        return False
