// src/pages/ScheduleManagementPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppDataStore } from "../services/appDataService";
import {
  createSchedule,
  updateSchedule,
  deleteScheduleAPI,
  getScheduleDetails,
} from "../services/scheduleService";
import type { Schedule as ScheduleType, SimpleUser } from "../types";
import ScheduleForm, {
  type ScheduleFormValues,
} from "../components/forms/ScheduleForm"; // Ensure path is correct
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import {
  Edit3,
  Trash2,
  PlusCircle,
  CheckCircle,
  XCircle,
  CalendarPlus, // Icon for main page title
  Activity, // For loading
  Info, // For empty states
} from "lucide-react";
import { Modal } from "../components/ui/Modal"; // Assuming Modal is in ui/
import { getUserDisplayName } from "../utils/userDisplay";
import { useToast } from "../hooks/useToast";

// Re-using formatDate
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(
    dateString.includes("T") ? dateString : dateString + "T00:00:00"
  );
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ScheduleManagementPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const { toast } = useToast();
  const {
    schedules,
    fetchSchedules,
    // For displaying presenter names in the list:
    presenterCandidates,
    fetchPresenterCandidates,
    // For form dropdowns (batches, discussion types are fetched within ScheduleForm)
    isLoading: appDataIsLoading, // General loading for store data
    error: listError, // Error from fetching schedules list
    // batches, // To determine if batch filter is needed for Batch Leader
  } = useAppDataStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(
    null
  );
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Loading state for form submission
  const [formErrorInModal, setFormErrorInModal] = useState<string | null>(null); // Specific error for modal form

  // Fetch initial schedules based on user role (backend handles scoping)
  useEffect(() => {
    const params: { batchId?: number } = {};
    if (loggedInUser?.role === "batch_leader" && loggedInUser.batch) {
      params.batchId = loggedInUser.batch; // Batch leaders only see/manage their batch's schedules
    }
    fetchSchedules(params);
  }, [fetchSchedules, loggedInUser]);

  // Fetch presenter candidates when schedules are loaded (for display in the list)
  useEffect(() => {
    if (loggedInUser?.is_staff && schedules.length > 0) {
      const presenterIds = new Set(
        schedules.map((s) => s.presenter).filter(Boolean) as number[]
      );
      if (presenterIds.size === 0) return;

      const neededPresenterIds = Array.from(presenterIds).filter(
        (id) => !presenterCandidates.some((pc) => pc.id === id)
      );

      if (neededPresenterIds.length > 0) {
        const fetchParams: { batchId?: number } = {};
        if (loggedInUser.role === "batch_leader" && loggedInUser.batch) {
          fetchParams.batchId = loggedInUser.batch;
        } // For other staff, fetch all presenter candidates (students)
        fetchPresenterCandidates(fetchParams);
      }
    }
  }, [loggedInUser, schedules, presenterCandidates, fetchPresenterCandidates]);

  const handleOpenCreateForm = () => {
    setEditingSchedule(null);
    setFormErrorInModal(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = async (scheduleId: number) => {
    setFormErrorInModal(null);
    toast.loading("Loading schedule details...", { id: "load-schedule" });
    try {
      const scheduleDetails = await getScheduleDetails(scheduleId);
      setEditingSchedule(scheduleDetails);
      setIsFormModalOpen(true);
      toast.dismiss("load-schedule");
    } catch (err: unknown) {
      const errorMsg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "detail" in err.response.data
          ? (err.response as { data: { detail?: string } }).data.detail
          : "Failed to load schedule for editing.";
      toast.error(errorMsg || "Failed to load schedule for editing.", {
        id: "load-schedule",
      });
    }
  };

  const handleFormSubmit = async (data: ScheduleFormValues) => {
    setIsSubmittingForm(true);
    setFormErrorInModal(null);
    const toastId = editingSchedule ? "update-schedule" : "create-schedule";
    toast.loading(
      editingSchedule ? "Updating schedule..." : "Creating schedule...",
      { id: toastId }
    );

    const payload = {
      batch: parseInt(data.batchId),
      discussion_type: parseInt(data.discussionTypeId),
      title: data.title,
      presenter: data.presenterId ? parseInt(data.presenterId) : null,
      scheduled_date: data.scheduled_date,
      description: data.description || "",
    };

    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, payload);
        toast.success("Schedule updated successfully!", { id: toastId });
      } else {
        await createSchedule(payload);
        toast.success("Schedule created successfully!", { id: toastId });
      }
      setIsFormModalOpen(false);
      setEditingSchedule(null);
      // Refresh schedules based on current user's scope
      const params: { batchId?: number } = {};
      if (loggedInUser?.role === "batch_leader" && loggedInUser.batch) {
        params.batchId = loggedInUser.batch;
      }
      fetchSchedules(params);
    } catch (err: unknown) {
      let errorMsg = "Operation failed.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object"
      ) {
        const response = err.response as { data?: Record<string, unknown> };
        if (response.data?.detail) {
          errorMsg =
            typeof response.data.detail === "string"
              ? response.data.detail
              : JSON.stringify(response.data.detail);
        } else if (typeof response.data === "object") {
          errorMsg = Object.values(response.data).flat().join("; ");
        }
      } else if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: string }).message === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setFormErrorInModal(errorMsg); // Show error inside modal
      toast.error(errorMsg || "Operation failed.", { id: toastId });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this schedule? This action cannot be undone."
      )
    ) {
      const toastId = "delete-schedule";
      toast.loading("Deleting schedule...", { id: toastId });
      try {
        await deleteScheduleAPI(scheduleId);
        toast.success("Schedule deleted successfully!", { id: toastId });
        const params: { batchId?: number } = {};
        if (loggedInUser?.role === "batch_leader" && loggedInUser.batch) {
          params.batchId = loggedInUser.batch;
        }
        fetchSchedules(params);
      } catch (err: unknown) {
        const errorMsg =
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "data" in err.response &&
          err.response.data &&
          typeof err.response.data === "object" &&
          "detail" in err.response.data
            ? (err.response as { data: { detail?: string } }).data.detail
            : "Failed to delete schedule.";
        toast.error(errorMsg || "Failed to delete schedule.", { id: toastId });
      }
    }
  };

  const getDisplayPresenterName = (
    schedule: ScheduleType
  ): string | React.ReactNode => {
    if (!schedule.presenter)
      return (
        <span className="italic text-light-text-secondary/80 dark:text-dark-text-secondary/80">
          N/A
        </span>
      );
    if (loggedInUser && schedule.presenter === loggedInUser.id) {
      return getUserDisplayName(loggedInUser);
    }
    const presenterUser = presenterCandidates.find(
      (u) => u.id === schedule.presenter
    );
    if (presenterUser) {
      return getUserDisplayName(presenterUser);
    }
    if (schedule.presenter_username) {
      const fallback: SimpleUser = {
        id: schedule.presenter,
        username: schedule.presenter_username,
        role: "student",
        first_name: "",
        last_name: "",
        batch_id: schedule.batch,
        is_staff: false,
        is_superuser: false,
      };
      return getUserDisplayName(fallback);
    }
    return (
      <span className="italic text-light-text-secondary/70 dark:text-dark-text-secondary/70">
        Dr. Unknown
      </span>
    );
  };

  const isLoadingPage = appDataIsLoading.schedules && !schedules.length;
  const isLoadingPresentersForDisplay =
    loggedInUser?.is_staff &&
    appDataIsLoading.presenterCandidates &&
    schedules.some(
      (s) =>
        s.presenter && !presenterCandidates.find((pc) => pc.id === s.presenter)
    );

  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Activity
          size={36}
          className="animate-spin text-primary dark:text-primary-light"
        />
        <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Loading Schedule Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text flex items-center">
            <CalendarPlus
              size={28}
              className="mr-3 text-primary dark:text-primary-light"
            />
            Manage Schedules
          </h1>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Create, edit, or delete discussion schedules.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateForm}
          variant="primary"
          size="md"
          leftIcon={<PlusCircle size={18} />}
        >
          Add New Schedule
        </Button>
      </header>

      {listError && (
        <Alert
          type="error"
          title="Error Loading Schedules"
          message={listError}
          className="my-4"
        />
      )}

      <Card elevated>
        <CardHeader noBorder>
          <CardTitle as="h2">
            Existing Schedules
            {loggedInUser?.role === "batch_leader" && loggedInUser.batch_name
              ? ` for ${loggedInUser.batch_name}`
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {appDataIsLoading.schedules && schedules.length === 0 ? (
            <div className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">
              Loading...
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Info
                size={56}
                className="mx-auto text-light-text-secondary/40 dark:text-dark-text-secondary/40 mb-4"
              />
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">
                No Schedules Found
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Click "Add New Schedule" to create one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pretty-scrollbar">
              <table className="min-w-full">
                <thead className="bg-light-bg dark:bg-dark-bg sticky top-0 z-[1]">
                  <tr>
                    <th className="table-th text-left pl-6">Date</th>
                    <th className="table-th text-left">Topic</th>
                    <th className="table-th text-left">Batch</th>
                    <th className="table-th text-left">
                      Presenter{" "}
                      {isLoadingPresentersForDisplay && (
                        <Activity
                          size={14}
                          className="inline animate-spin ml-1"
                        />
                      )}
                    </th>
                    <th className="table-th text-center">Status</th>
                    <th className="table-th text-center pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="group hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-100"
                    >
                      <td className="table-td pl-6">
                        {formatDate(schedule.scheduled_date)}
                      </td>
                      <td className="table-td max-w-sm">
                        <span
                          className="block font-medium text-light-text dark:text-dark-text truncate group-hover:whitespace-normal group-hover:text-primary dark:group-hover:text-primary-light"
                          title={schedule.title}
                        >
                          {schedule.title}
                        </span>
                        <span className="block text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {schedule.discussion_type_name}
                        </span>
                      </td>
                      <td className="table-td-secondary">
                        {schedule.batch_name}
                      </td>
                      <td className="table-td-secondary">
                        {getDisplayPresenterName(schedule)}
                      </td>
                      <td className="table-td text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold 
                                         ${
                                           schedule.is_submission_uploaded
                                             ? "bg-success/10 text-success dark:bg-green-500/20 dark:text-green-300"
                                             : "bg-error/10 text-error dark:bg-red-500/20 dark:text-red-300"
                                         }`}
                        >
                          {schedule.is_submission_uploaded ? (
                            <CheckCircle size={14} className="mr-1.5" />
                          ) : (
                            <XCircle size={14} className="mr-1.5" />
                          )}
                          {schedule.is_submission_uploaded
                            ? "Uploaded"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="table-td text-center pr-6">
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditForm(schedule.id)}
                            title="Edit Schedule"
                            className="text-light-text-secondary hover:text-primary dark:text-dark-text-secondary dark:hover:text-primary-light"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            title="Delete Schedule"
                            className="text-light-text-secondary hover:text-error dark:text-dark-text-secondary dark:hover:text-error"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {schedules.length > 0 && (
          <CardFooter className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Managing {schedules.length} schedule(s).
          </CardFooter>
        )}
      </Card>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSchedule(null);
          setFormErrorInModal(null);
        }}
        title={editingSchedule ? "Edit Schedule" : "Create New Schedule"}
        size="lg" // Or "xl" if form is long
      >
        {formErrorInModal && (
          <Alert
            type="error"
            message={formErrorInModal}
            onClose={() => setFormErrorInModal(null)}
            className="mb-4"
          />
        )}
        <ScheduleForm
          onSubmit={handleFormSubmit}
          initialData={editingSchedule}
          isSubmitting={isSubmittingForm}
          submitButtonText={
            editingSchedule ? "Update Schedule" : "Create Schedule"
          }
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingSchedule(null);
            setFormErrorInModal(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ScheduleManagementPage;
