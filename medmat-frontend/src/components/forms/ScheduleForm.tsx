import React, { useEffect, useMemo } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import type { Schedule as ScheduleType, SimpleUser } from "../../types"; // UserFromAuth to distinguish
import { useAppDataStore } from "../../services/appDataService";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { getUserDisplayName } from "../../utils/userDisplay"; // For displaying student names

export interface ScheduleFormValues {
  batchId: string;
  discussionTypeId: string;
  title: string;
  presenterId?: string;
  scheduled_date: string;
  description?: string;
}

interface ScheduleFormProps {
  onSubmit: SubmitHandler<ScheduleFormValues>;
  initialData?: ScheduleType | null;
  isSubmitting: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText = "Save Schedule",
  onCancel,
}) => {
  const { user: loggedInUser } = useAuth(); // This is UserTypeFromAuth
  const {
    batches,
    discussionTypes,
    presenterCandidates, // Using new state name
    fetchBatches,
    fetchDiscussionTypes,
    fetchPresenterCandidates, // Using new fetch function
    isLoading: appDataIsLoading,
    error: appDataError, // Generic error from store
  } = useAppDataStore();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScheduleFormValues>({
    defaultValues: {
      /* ... as before ... */
    },
  });

  const watchedBatchId = watch("batchId");

  useEffect(() => {
    if (!batches.length) fetchBatches();
    if (!discussionTypes.length) fetchDiscussionTypes();
  }, [
    fetchBatches,
    fetchDiscussionTypes,
    batches.length,
    discussionTypes.length,
  ]);

  useEffect(() => {
    if (initialData) {
      reset({
        /* ... as before ... */ batchId: initialData.batch.toString(),
        discussionTypeId: initialData.discussion_type.toString(),
        title: initialData.title,
        presenterId: initialData.presenter?.toString() || "",
        scheduled_date: initialData.scheduled_date,
        description: initialData.description || "",
      });
      if (loggedInUser?.is_staff && initialData.batch) {
        // Staff can edit, so fetch presenters
        fetchPresenterCandidates({ batchId: initialData.batch });
      }
    } else {
      const defaultBatchId =
        loggedInUser?.role === "batch_leader" && loggedInUser.batch
          ? loggedInUser.batch.toString()
          : "";
      reset({
        batchId: defaultBatchId,
        discussionTypeId: "",
        title: "",
        presenterId: "",
        scheduled_date: "",
        description: "",
      });
      if (loggedInUser?.is_staff && defaultBatchId) {
        fetchPresenterCandidates({ batchId: parseInt(defaultBatchId) });
      }
    }
  }, [initialData, reset, loggedInUser, setValue, fetchPresenterCandidates]);

  useEffect(() => {
    if (loggedInUser?.is_staff) {
      // Only staff should trigger fetching presenter candidates
      if (watchedBatchId) {
        fetchPresenterCandidates({ batchId: parseInt(watchedBatchId) });
      } else {
        // If staff clears batch, optionally clear presenter candidates
        useAppDataStore.setState({ presenterCandidates: [] });
      }
    }
  }, [fetchPresenterCandidates, watchedBatchId, loggedInUser?.is_staff]);

  const batchOptions = useMemo(
    () => batches.map((b) => ({ value: b.id.toString(), label: b.name })),
    [batches]
  );
  const discussionTypeOptions = useMemo(
    () =>
      discussionTypes.map((dt) => ({
        value: dt.id.toString(),
        label: dt.name,
      })),
    [discussionTypes]
  );

  const presenterOptions = useMemo(() => {
    // presenterCandidates are SimpleUser[], getUserDisplayName expects User | SimpleUser
    return presenterCandidates.map((candidate: SimpleUser) => ({
      value: candidate.id.toString(),
      label: getUserDisplayName(candidate), // candidate is SimpleUser, fits getUserDisplayName
    }));
  }, [presenterCandidates]);

  // More specific loading check for the presenter part
  const isLoadingPresenters =
    watchedBatchId &&
    loggedInUser?.is_staff &&
    appDataIsLoading.presenterCandidates;

  if (
    appDataIsLoading.batches ||
    appDataIsLoading.discussionTypes ||
    isLoadingPresenters
  ) {
    return <div className="text-center p-4">Loading form options...</div>;
  }

  // Display general appDataError if it exists (e.g., from fetchPresenterCandidates)
  if (appDataError && loggedInUser?.is_staff && watchedBatchId) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Error: {appDataError}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Batch and Discussion Type Selects as before */}
      <Controller
        name="batchId"
        control={control}
        rules={{ required: "Batch is required" }}
        render={({ field }) => (
          <Select
            label="Batch"
            options={batchOptions}
            placeholder="Select Batch"
            error={errors.batchId?.message}
            disabled={
              (loggedInUser?.role === "batch_leader" && !!loggedInUser.batch) ||
              isSubmitting
            }
            {...field}
            onChange={(e) => {
              field.onChange(e);
              setValue("presenterId", "");
            }}
          />
        )}
      />
      <Controller
        name="discussionTypeId"
        control={control}
        rules={{ required: "Discussion Type is required" }}
        render={({ field }) => (
          <Select
            label="Discussion Type"
            options={discussionTypeOptions}
            placeholder="Select Discussion Type"
            error={errors.discussionTypeId?.message}
            disabled={isSubmitting}
            {...field}
          />
        )}
      />
      {/* Title, Scheduled Date, Description Inputs as before */}
      <Input
        label="Title / Topic"
        id="schedule-title"
        type="text"
        {...register("title", { required: "Title is required" })}
        error={errors.title?.message}
        disabled={isSubmitting}
      />
      <Input
        label="Scheduled Date"
        id="schedule-date"
        type="date"
        {...register("scheduled_date", {
          required: "Scheduled date is required",
          validate: (value) =>
            new Date(value) >= new Date(new Date().setHours(0, 0, 0, 0)) ||
            initialData?.scheduled_date === value ||
            "Date cannot be in the past",
        })}
        error={errors.scheduled_date?.message}
        disabled={isSubmitting}
      />

      {/* Presenter Dropdown: Only for Staff and if batch is selected */}
      {loggedInUser?.is_staff && watchedBatchId && (
        <>
          <Controller
            name="presenterId"
            control={control}
            render={({ field }) => (
              <Select
                label="Presenter (Student)"
                options={presenterOptions}
                placeholder={
                  isLoadingPresenters
                    ? "Loading students..."
                    : "Select Presenter (Optional)"
                }
                error={errors.presenterId?.message}
                disabled={
                  isSubmitting ||
                  isLoadingPresenters ||
                  !presenterOptions.length
                }
                isClearable
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
          {presenterOptions.length === 0 && !isLoadingPresenters && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No eligible students found in the selected batch to assign as
              presenter.
            </p>
          )}
        </>
      )}

      {/* If student is viewing, and it's their presentation, show their name (read-only) */}
      {!loggedInUser?.is_staff &&
        initialData?.presenter === loggedInUser?.id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Presenter
            </label>
            <p className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
              {getUserDisplayName(loggedInUser)} (You)
            </p>
          </div>
        )}

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Description (Optional)"
            id="schedule-description"
            rows={3}
            error={errors.description?.message}
            disabled={isSubmitting}
            {...field}
          />
        )}
      />
      <div className="flex justify-end space-x-3 pt-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="min-w-[120px]"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default ScheduleForm;
