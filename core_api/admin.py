from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Batch, DiscussionType, Schedule, UploadedFile


class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "email")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_superuser", "groups", "user_permissions")},
        ),  # is_staff removed here
        (
            "Custom Info",
            {"fields": ("role", "batch", "is_staff")},
        ),  # is_staff can be displayed
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Custom Info",
            {"fields": ("role", "batch", "first_name", "last_name", "email")},
        ),
    )
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "batch",
        "is_staff",
        "is_active",
    )
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "role",
        "batch__name",
    )  # Added batch__name for better filtering
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("username",)
    readonly_fields = (
        "is_staff",
        "last_login",
        "date_joined",
    )  # is_staff is now read-only in admin form


admin.site.register(User, UserAdmin)

# BatchAdmin, DiscussionTypeAdmin, ScheduleAdmin, UploadedFileAdmin remain the same
# as the previous complete version. Ensure their list_filter and autocomplete_fields are useful.


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("name", "start_year", "end_year", "is_active")
    list_filter = ("is_active", "start_year")
    search_fields = ("name",)


@admin.register(DiscussionType)
class DiscussionTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "scheduled_date",
        "batch",
        "discussion_type",
        "presenter",
        "is_submission_uploaded",
        "created_by",
    )
    list_filter = (
        "scheduled_date",
        "batch__name",
        "discussion_type__name",
        "presenter__username",
        "created_by__username",
    )
    search_fields = ("title", "presenter__username", "batch__name")
    autocomplete_fields = ["presenter", "batch", "discussion_type", "created_by"]
    list_select_related = (
        "batch",
        "discussion_type",
        "presenter",
        "created_by",
    )  # Performance improvement


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = (
        "original_filename",
        "uploader",
        "batch",
        "discussion_type",
        "schedule",
        "upload_date",
    )
    list_filter = (
        "upload_date",
        "batch__name",
        "discussion_type__name",
        "uploader__username",
    )
    search_fields = (
        "original_filename",
        "description",
        "uploader__username",
        "schedule__title",
    )
    readonly_fields = ("upload_date", "display_file_url")  # Renamed for clarity
    autocomplete_fields = ["uploader", "batch", "discussion_type", "schedule"]
    list_select_related = (
        "uploader",
        "batch",
        "discussion_type",
        "schedule",
    )  # Performance improvement

    def display_file_url(self, obj):
        from django.utils.html import format_html

        if obj.file and hasattr(obj.file, "url"):
            return format_html(
                "<a href='{url}' target='_blank'>{name}</a>",
                url=obj.file.url,
                name=os.path.basename(obj.file.name),
            )
        return "-"

    display_file_url.short_description = "File Link"
