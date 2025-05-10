from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
import os


# get_file_upload_path function remains the same
def get_file_upload_path(instance, filename):
    batch_slug = slugify(instance.batch.name)
    discussion_type_slug = slugify(instance.discussion_type.slug)

    base, ext = os.path.splitext(filename)
    if instance.schedule:
        presenter_name_part = ""
        if instance.schedule.presenter:
            presenter_name_part = slugify(
                instance.schedule.presenter.get_full_name()
                or instance.schedule.presenter.username
            )
        else:
            presenter_name_part = "general"

        topic_slug = slugify(instance.schedule.title)
        date_str = instance.schedule.scheduled_date.strftime("%Y-%m-%d")
        new_filename = f"{date_str}_{topic_slug}_{presenter_name_part}{ext}"
    elif instance.description:
        new_filename = f"{slugify(instance.description)}{ext}"
    else:
        safe_original_filename = "".join(
            c for c in instance.original_filename if c.isalnum() or c in [".", "_", "-"]
        ).strip()
        if not safe_original_filename:
            safe_original_filename = (
                f"uploaded_file_{instance.pk if instance.pk else 'temp'}{ext}"
            )
        new_filename = safe_original_filename
    return os.path.join(batch_slug, discussion_type_slug, new_filename)


class Batch(models.Model):
    name = models.CharField(
        max_length=100, unique=True, help_text="e.g., 2024-2027 Batch"
    )
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Batches"
        ordering = ["-start_year", "name"]


class User(AbstractUser):
    email = models.EmailField(blank=True, null=True)

    ROLE_CHOICES = [
        ("student", "Student"),
        ("batch_leader", "Batch Leader"),
        ("professor", "Professor"),
        # No 'admin' role here; superuser flag handles that.
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    batch = models.ForeignKey(
        Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name="members"
    )

    # Store the original role to detect changes
    _original_role = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_role = self.role

    def save(self, *args, **kwargs):
        # Automatically manage is_staff based on role
        if self.role in ["batch_leader", "professor"]:
            self.is_staff = True
        elif (
            self._original_role in ["batch_leader", "professor"]
            and self.role == "student"
        ):
            # If role changed FROM batch_leader/professor TO student, remove staff status
            # unless they are also a superuser.
            if not self.is_superuser:
                self.is_staff = False
        # If role is student and not superuser, ensure is_staff is False
        elif self.role == "student" and not self.is_superuser:
            self.is_staff = False

        super().save(*args, **kwargs)
        self._original_role = self.role  # Update original role after save

    def __str__(self):
        return self.username

    class Meta:
        ordering = ["username"]


# DiscussionType, Schedule, UploadedFile models remain the same as previous complete version.
class DiscussionType(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="e.g., Department Discussion, Common Discussion, Schedule Document",
    )
    slug = models.SlugField(
        unique=True, help_text="Auto-generated slug for folder names. Keep it simple."
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Schedule(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="schedules")
    discussion_type = models.ForeignKey(
        DiscussionType, on_delete=models.PROTECT, related_name="schedules"
    )
    title = models.CharField(
        max_length=255,
        help_text="e.g., Calcarea Carbonicum, January Dept Discussion Schedule",
    )
    presenter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="presentations",
        limit_choices_to={"role__in": ["student"]},  # Presenters are typically students
    )
    scheduled_date = models.DateField()
    # created_by can be any staff member (Prof, Batch Leader, Superuser Admin)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_schedules",
        limit_choices_to={"is_staff": True},
    )
    description = models.TextField(blank=True)

    @property
    def is_submission_uploaded(self):
        return self.files.exists()

    def __str__(self):
        return f"{self.batch.name} - {self.title} ({self.scheduled_date.strftime('%d-%m-%Y')})"

    class Meta:
        ordering = ["-scheduled_date", "title"]


class UploadedFile(models.Model):
    uploader = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="uploaded_files"
    )
    batch = models.ForeignKey(
        Batch, on_delete=models.CASCADE, related_name="batch_files"
    )
    discussion_type = models.ForeignKey(
        DiscussionType, on_delete=models.PROTECT, related_name="type_files"
    )
    schedule = models.ForeignKey(
        Schedule, on_delete=models.SET_NULL, null=True, blank=True, related_name="files"
    )

    file = models.FileField(upload_to=get_file_upload_path, max_length=500)
    original_filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="User provided description or topic for general files",
    )

    def save(self, *args, **kwargs):
        if not self.pk and self.file:
            self.original_filename = self.file.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.original_filename

    @property
    def file_url(self):
        if self.file:
            return self.file.url
        return None

    class Meta:
        ordering = ["-upload_date", "original_filename"]
