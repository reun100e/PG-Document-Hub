// src/pages/FileUploadPage.tsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAppDataStore } from "../services/appDataService";
import { uploadFile } from "../services/fileService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import {
  UploadCloud,
  Paperclip,
  CheckCircle,
  AlertCircle as AlertTriangleIcon,
  Loader2,
  Trash2,
  FileText,
  ListPlus, // For "Add more files"
} from "lucide-react";
import { getUserDisplayName } from "../utils/userDisplay";
import { useToast } from "../hooks/useToast"; // Assuming you created this hook

// --- Interfaces and Constants ---
interface FormValues {
  batchId: string;
  discussionTypeId: string;
  scheduleId?: string;
  description?: string;
}

// Define allowed file types with more common MIME types and extensions
const COMMON_EXTENSIONS: { [key: string]: string[] } = {
  "application/pdf": ["pdf"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    "docx",
  ],
  "application/vnd.ms-powerpoint": ["ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    "pptx",
  ],
  "application/vnd.ms-excel": ["xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ["xlsx"],
  "text/plain": ["txt"],
  "text/csv": ["csv"],
  "image/jpeg": ["jpeg", "jpg"],
  "image/png": ["png"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "image/svg+xml": ["svg"],
  "audio/mpeg": ["mp3"],
  "audio/ogg": ["ogg"],
  "audio/wav": ["wav"],
  "video/mp4": ["mp4"],
  "video/webm": ["webm"],
  "video/quicktime": ["mov"],
  "application/zip": ["zip"],
  "application/rar": ["rar"],
  // Add more as needed
};
const ALLOWED_MIME_TYPES = Object.keys(COMMON_EXTENSIONS);
const MAX_FILE_SIZE_MB = 250;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 25;

interface UploadableFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  error?: string;
}

// --- Component ---
const FileUploadPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    batches,
    discussionTypes,
    schedules,
    presenterCandidates,
    fetchBatches,
    fetchDiscussionTypes,
    fetchSchedules,
    fetchPresenterCandidates,
    isLoading: appDataIsLoading,
  } = useAppDataStore();

  const [selectedFiles, setSelectedFiles] = useState<UploadableFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingOverall, setIsSubmittingOverall] = useState(false); // For the entire batch

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid: isFormMetaValid },
    reset: resetFormMeta,
    setValue: setFormMetaValue,
    trigger: triggerFormMetaValidation,
  } = useForm<FormValues>({
    defaultValues: {
      batchId: "",
      discussionTypeId: "",
      scheduleId: "",
      description: "",
    },
    mode: "onChange",
  });

  const watchedBatchId = watch("batchId");
  const watchedDiscussionTypeId = watch("discussionTypeId");
  const watchedScheduleId = watch("scheduleId");

  // Effect to initialize form with query params or user defaults
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const prefillBatchId =
      queryParams.get("batchId") || loggedInUser?.batch?.toString() || "";
    const prefillDiscussionTypeId = queryParams.get("discussionTypeId") || "";
    const prefillScheduleId = queryParams.get("scheduleId") || "";

    if (prefillBatchId)
      setFormMetaValue("batchId", prefillBatchId, {
        shouldValidate: true,
        shouldDirty: !!prefillBatchId,
      });
    if (prefillDiscussionTypeId)
      setFormMetaValue("discussionTypeId", prefillDiscussionTypeId, {
        shouldValidate: true,
        shouldDirty: !!prefillDiscussionTypeId,
      });
    if (prefillScheduleId)
      setFormMetaValue("scheduleId", prefillScheduleId, {
        shouldValidate: true,
        shouldDirty: !!prefillScheduleId,
      });
  }, [location.search, loggedInUser, setFormMetaValue]);

  // Effect for fetching dropdown data
  useEffect(() => {
    if (!batches.length) fetchBatches();
    if (!discussionTypes.length) fetchDiscussionTypes();
  }, [
    fetchBatches,
    batches.length,
    fetchDiscussionTypes,
    discussionTypes.length,
  ]);

  // Effect for fetching schedules and presenters based on batch/type
  useEffect(() => {
    if (watchedBatchId && watchedDiscussionTypeId) {
      const params = { batchId: parseInt(watchedBatchId) };
      fetchSchedules(params);
      if (loggedInUser?.is_staff) {
        fetchPresenterCandidates(params); // Staff might need to see presenters
      }
    } else {
      // Clear schedules if batch/type is not selected
      useAppDataStore.setState((state) => ({ ...state, schedules: [] }));
    }
  }, [
    watchedBatchId,
    watchedDiscussionTypeId,
    fetchSchedules,
    loggedInUser,
    fetchPresenterCandidates,
  ]);

  const validateFile = useCallback(
    (file: File): { isValid: boolean; error?: string } => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
          isValid: false,
          error: `File "${file.name}" (${(file.size / 1024 / 1024).toFixed(
            1
          )}MB) exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
        };
      }
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const mimeType = file.type.toLowerCase();

      let typeAllowed = ALLOWED_MIME_TYPES.includes(mimeType);
      if (!typeAllowed && mimeType === "application/octet-stream") {
        // Fallback for generic MIME type
        typeAllowed = Object.values(COMMON_EXTENSIONS)
          .flat()
          .includes(fileExtension);
      } else if (!typeAllowed) {
        // Check extensions for known MIME types
        const extensionsForMime = COMMON_EXTENSIONS[mimeType];
        if (extensionsForMime) {
          typeAllowed = extensionsForMime.includes(fileExtension);
        }
      }
      if (!typeAllowed) {
        return {
          isValid: false,
          error: `File type for "${file.name}" (${
            fileExtension || mimeType
          }) is not supported.`,
        };
      }
      return { isValid: true };
    },
    []
  );

  const addFilesToUploadQueue = useCallback(
    (newFiles: FileList | File[]) => {
      const filesToAdd: UploadableFile[] = [];
      const localErrors: string[] = [];
      let filesSkipped = 0;

      Array.from(newFiles).forEach((file) => {
        if (selectedFiles.length + filesToAdd.length >= MAX_FILES_PER_UPLOAD) {
          filesSkipped++;
          return;
        }
        if (file.name === ".DS_Store" || file.name === "Thumbs.db") return;

        const validation = validateFile(file);
        if (validation.isValid) {
          if (
            !selectedFiles.find(
              (f) =>
                f.file.name === file.name &&
                f.file.size === file.size &&
                f.file.lastModified === file.lastModified
            )
          ) {
            filesToAdd.push({
              id: `${file.name}-${file.lastModified}-${
                file.size
              }-${Math.random().toString(36).substring(2, 9)}`,
              file,
              status: "pending",
            });
          } else {
            localErrors.push(`File "${file.name}" is already in the queue.`);
          }
        } else {
          localErrors.push(validation.error || `Invalid file: ${file.name}`);
        }
      });

      if (localErrors.length > 0) toast.error(localErrors.join("\n"));
      if (filesSkipped > 0)
        toast.info(
          `Max ${MAX_FILES_PER_UPLOAD} files allowed. ${filesSkipped} files were not added.`
        );

      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    },
    [selectedFiles, validateFile, toast]
  );

  const handleNativeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFilesToUploadQueue(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
  };

  const removeFileFromQueue = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.filter((f) => f.id !== fileId && f.status !== "uploading")
    );
  };

  const dragEvents = {
    onDragOver: useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []),
    onDragLeave: useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []),
    onDrop: useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length)
          addFilesToUploadQueue(e.dataTransfer.files);
        e.dataTransfer.clearData();
      },
      [addFilesToUploadQueue]
    ),
  };

  const onFormSubmit: SubmitHandler<FormValues> = async (metaData) => {
    // ... (submission logic from previous version, using toast for feedback)
    if (!loggedInUser) {
      toast.error("User not authenticated.");
      return;
    }
    const filesToProcess = selectedFiles.filter(
      (f) => f.status === "pending" || f.status === "error"
    );
    if (filesToProcess.length === 0) {
      toast.info("No files are pending upload.");
      return;
    }

    const isDescriptionRequired = !metaData.scheduleId;
    if (isDescriptionRequired && !metaData.description?.trim()) {
      triggerFormMetaValidation("description"); // Show error on description field
      toast.error(
        "Description is required when not linking to a specific schedule."
      );
      return;
    }
    if (!isFormMetaValid) {
      // Check overall metadata form validity (batch, type)
      toast.error(
        "Please fill in all required fields (Batch, Discussion Type) correctly."
      );
      return;
    }

    setIsSubmittingOverall(true);
    let successCount = 0;
    const totalToUpload = filesToProcess.length;

    for (const uploadableFile of filesToProcess) {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadableFile.id
            ? { ...f, status: "uploading", error: undefined, progress: 0 }
            : f
        )
      );
      // Simulate progress for UI
      for (let i = 0; i <= 100; i += Math.floor(Math.random() * 20) + 10) {
        await new Promise((res) => setTimeout(res, 50 + Math.random() * 50));
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadableFile.id
              ? { ...f, progress: Math.min(i, 100) }
              : f
          )
        );
        if (i >= 100) break;
      }
      try {
        await uploadFile({
          file: uploadableFile.file,
          batch: parseInt(metaData.batchId),
          discussion_type: parseInt(metaData.discussionTypeId),
          schedule: metaData.scheduleId
            ? parseInt(metaData.scheduleId)
            : undefined,
          description:
            metaData.description ||
            uploadableFile.file.name.split(".").slice(0, -1).join(".") ||
            "Uploaded File",
        });
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadableFile.id
              ? { ...f, status: "success", progress: 100 }
              : f
          )
        );
        successCount++;
      } catch (err: unknown) {
        let errorMsg = "Upload failed.";
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as { response?: unknown }).response === "object"
        ) {
          const response = (
            err as {
              response?: {
                data?: { detail?: string; file?: string[]; message?: string };
              };
            }
          ).response;
          errorMsg =
            response?.data?.detail ||
            response?.data?.file?.[0] ||
            response?.data?.message ||
            errorMsg;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadableFile.id
              ? { ...f, status: "error", error: errorMsg, progress: 0 }
              : f
          )
        );
      }
    }

    setIsSubmittingOverall(false);
    if (successCount === totalToUpload) {
      toast.success(`All ${successCount} files uploaded successfully!`);
      resetFormMeta();
      setSelectedFiles([]);
    } else if (successCount > 0) {
      toast.info(
        `${successCount} of ${totalToUpload} files uploaded. Some had issues.`
      );
    } else if (totalToUpload > 0) {
      toast.error(
        "All file uploads failed. Please check errors and try again."
      );
    }
  };

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
  const scheduleOptions = useMemo(() => {
    if (!watchedBatchId || !watchedDiscussionTypeId || !schedules) return [];
    return schedules
      .filter(
        (s) =>
          s.batch.toString() === watchedBatchId &&
          s.discussion_type.toString() === watchedDiscussionTypeId
      )
      .map((s) => {
        const presenterObj = loggedInUser?.is_staff
          ? presenterCandidates.find((p) => p.id === s.presenter)
          : s.presenter === loggedInUser?.id
          ? loggedInUser
          : null;
        const presenterDisplay = s.presenter
          ? presenterObj
            ? getUserDisplayName(presenterObj)
            : s.presenter_username || `ID: ${s.presenter}`
          : "General";
        return {
          value: s.id.toString(),
          label: `${s.scheduled_date} - ${s.title.substring(
            0,
            40
          )}... (${presenterDisplay})`,
        };
      });
  }, [
    schedules,
    watchedBatchId,
    watchedDiscussionTypeId,
    loggedInUser,
    presenterCandidates,
  ]);

  const isLoadingDropdownOptions =
    appDataIsLoading.batches || appDataIsLoading.discussionTypes;
  const filesReadyForUpload = selectedFiles.filter(
    (f) => f.status === "pending" || f.status === "error"
  ).length;

  // Expose react-hook-form's register for use in Input fields
  const { register } = useForm<FormValues>({
    defaultValues: {
      batchId: "",
      discussionTypeId: "",
      scheduleId: "",
      description: "",
    },
    mode: "onChange",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text flex items-center justify-center">
          <UploadCloud
            size={32}
            className="mr-3 text-primary dark:text-primary-light"
          />
          Upload Files
        </h1>
        <p className="mt-2 text-md text-light-text-secondary dark:text-dark-text-secondary">
          Select or drag and drop files, then provide necessary details.
        </p>
      </header>

      <Card elevated>
        <CardContent className="pt-6">
          <div
            {...dragEvents}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 rounded-xl text-center cursor-pointer
                       transition-all duration-200 ease-in-out group
                       ${
                         isDragging
                           ? "border-primary ring-2 ring-primary/40 bg-primary/5 dark:bg-primary-dark/5"
                           : "border-light-border dark:border-dark-border hover:border-primary/70 dark:hover:border-primary-light/70 bg-light-bg dark:bg-dark-bg"
                       }`}
          >
            <input
              id="file-upload-input-hidden"
              type="file"
              className="sr-only"
              multiple
              onChange={handleNativeFileChange}
              ref={fileInputRef}
              accept={ALLOWED_MIME_TYPES.join(",")}
            />
            <div
              className={`mb-4 p-3 rounded-full transition-colors ${
                isDragging
                  ? "bg-primary/20 text-primary dark:bg-primary-dark/30 dark:text-primary-light"
                  : "bg-light-border dark:bg-dark-border text-light-text-secondary dark:text-dark-text-secondary group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary-dark/20 dark:group-hover:text-primary-light"
              }`}
            >
              <UploadCloud size={32} strokeWidth={1.5} />
            </div>
            <p className="text-md font-medium text-light-text dark:text-dark-text">
              <span className="text-primary dark:text-primary-light font-semibold">
                Click to browse
              </span>{" "}
              or drag & drop
            </p>
            <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
              Max {MAX_FILES_PER_UPLOAD} files, up to {MAX_FILE_SIZE_MB}MB each.
            </p>
            {selectedFiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                leftIcon={<ListPlus size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Add more files
              </Button>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-md font-medium text-light-text dark:text-dark-text">
                Queued Files ({selectedFiles.length}/{MAX_FILES_PER_UPLOAD}):
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 -mr-2 pretty-scrollbar">
                {selectedFiles.map((uf) => (
                  <div
                    key={uf.id}
                    className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center min-w-0 gap-2">
                        {uf.status === "pending" && (
                          <Paperclip
                            size={16}
                            className="text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0"
                          />
                        )}
                        {uf.status === "uploading" && (
                          <Loader2
                            size={16}
                            className="text-blue-500 animate-spin flex-shrink-0"
                          />
                        )}
                        {uf.status === "success" && (
                          <CheckCircle
                            size={16}
                            className="text-success flex-shrink-0"
                          />
                        )}
                        {uf.status === "error" && (
                          <AlertTriangleIcon
                            size={16}
                            className="text-error flex-shrink-0"
                          />
                        )}
                        <span
                          className="font-medium text-light-text dark:text-dark-text truncate"
                          title={uf.file.name}
                        >
                          {uf.file.name}
                        </span>
                        <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
                          ({(uf.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      {(uf.status === "pending" || uf.status === "error") &&
                        !isSubmittingOverall && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFileFromQueue(uf.id)}
                            className="text-light-text-secondary hover:text-error dark:text-dark-text-secondary dark:hover:text-error"
                            title="Remove file"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                    </div>
                    {(uf.status === "uploading" || uf.status === "success") &&
                      uf.progress !== undefined && (
                        <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 mt-2">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ease-linear ${
                              uf.status === "success"
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            style={{ width: `${uf.progress}%` }}
                          ></div>
                        </div>
                      )}
                    {uf.status === "error" && uf.error && (
                      <p className="text-xs text-error mt-1.5" title={uf.error}>
                        {uf.error.substring(0, 100)}
                        {uf.error.length > 100 && "..."}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card elevated>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <CardHeader>
              <CardTitle icon={<FileText size={22} />} as="h2">
                File Details & Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Controller
                name="batchId"
                control={control}
                rules={{ required: "Batch is required" }}
                render={({ field }) => (
                  <Select
                    label="Batch *"
                    options={batchOptions}
                    placeholder={
                      isLoadingDropdownOptions ? "Loading..." : "Select Batch"
                    }
                    error={!!errors.batchId}
                    errorMessage={errors.batchId?.message}
                    disabled={
                      (loggedInUser?.role === "student" &&
                        !!loggedInUser.batch) ||
                      isSubmittingOverall ||
                      isLoadingDropdownOptions
                    }
                    {...field}
                  />
                )}
              />
              <Controller
                name="discussionTypeId"
                control={control}
                rules={{ required: "Discussion Type is required" }}
                render={({ field }) => (
                  <Select
                    label="Discussion Type *"
                    options={discussionTypeOptions}
                    placeholder={
                      isLoadingDropdownOptions
                        ? "Loading..."
                        : "Select Discussion Type"
                    }
                    error={!!errors.discussionTypeId}
                    errorMessage={errors.discussionTypeId?.message}
                    disabled={isSubmittingOverall || isLoadingDropdownOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name="scheduleId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Link to Schedule (Optional)"
                    options={scheduleOptions}
                    placeholder={
                      appDataIsLoading.schedules
                        ? "Loading schedules..."
                        : "Select a schedule or leave blank"
                    }
                    error={!!errors.scheduleId}
                    errorMessage={errors.scheduleId?.message}
                    disabled={
                      isSubmittingOverall ||
                      appDataIsLoading.schedules ||
                      !watchedBatchId ||
                      !watchedDiscussionTypeId
                    }
                    isClearable
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
              <Input
                label={`Overall Description / Topic ${
                  !watchedScheduleId ? "*" : "(Optional)"
                }`}
                id="file-description"
                {...register("description", {
                  validate: (value) =>
                    !watchedScheduleId && (!value || value.trim() === "")
                      ? "Description is required if not linking to a schedule"
                      : true,
                })}
                error={!!errors.description}
                errorMessage={errors.description?.message}
                disabled={isSubmittingOverall}
                placeholder="e.g., January Dept Discussion Materials, Topic Key Points"
                as="textarea" // Assuming Input can take 'as' prop or is a Textarea
                rows={3}
              />
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                isLoading={isSubmittingOverall}
                disabled={
                  isSubmittingOverall ||
                  isLoadingDropdownOptions ||
                  filesReadyForUpload === 0 ||
                  !isFormMetaValid
                }
                className="w-full sm:w-auto"
                size="lg"
                leftIcon={<UploadCloud size={18} />}
              >
                {isSubmittingOverall
                  ? `Uploading...`
                  : `Upload ${filesReadyForUpload} File(s)`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default FileUploadPage;
