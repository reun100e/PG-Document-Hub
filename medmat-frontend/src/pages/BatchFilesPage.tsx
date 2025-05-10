// src/pages/BatchFilesPage.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getFiles,
  deleteFile,
  downloadFileProgrammatically,
} from "../services/fileService"; // Import new download function
import { useAppDataStore } from "../services/appDataService";
import type { UploadedFile as UploadedFileType, SimpleUser } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import {
  Download,
  Trash2,
  FileWarning,
  FolderOpen,
  Filter,
  Activity,
  UploadCloud,
} from "lucide-react";
import { getUserDisplayName } from "../utils/userDisplay";
import { useToast } from "../hooks/useToast";

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

const BatchFilesPage: React.FC = () => {
  const { batchId: batchIdParam } = useParams<{ batchId: string }>();
  const location = useLocation();
  const { user: loggedInUser } = useAuth();
  const { toast } = useToast();
  const {
    discussionTypes,
    fetchDiscussionTypes,
    batches,
    fetchBatches,
    presenterCandidates,
    isLoading: appDataIsLoading,
    error: appDataError,
  } = useAppDataStore();

  const [files, setFiles] = useState<UploadedFileType[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [filterDiscussionTypeId, setFilterDiscussionTypeId] =
    useState<string>("");
  const [filterScheduleId, setFilterScheduleId] = useState<string>("");

  const currentBatch = useMemo(
    () => batches.find((b) => b.id.toString() === batchIdParam),
    [batches, batchIdParam]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const scheduleIdFromQuery = queryParams.get("schedule_id");
    setFilterScheduleId(scheduleIdFromQuery || "");
  }, [location.search]);

  useEffect(() => {
    if (!discussionTypes.length) fetchDiscussionTypes();
    if (!batches.length) fetchBatches();

    // Fetch user details if staff, for better uploader name display
    if (loggedInUser?.is_staff && presenterCandidates.length === 0) {
      // This might fetch students primarily; adjust if other staff roles can upload and need full name display.
      // For now, getDisplayUploaderName handles fallbacks.
      // fetchPresenterCandidates({ batchId: batchIdParam ? parseInt(batchIdParam) : undefined });
    }
  }, [
    fetchDiscussionTypes,
    discussionTypes.length,
    fetchBatches,
    batches.length,
    loggedInUser,
    presenterCandidates.length /* fetchPresenterCandidates, batchIdParam */,
  ]);

  const fetchBatchFiles = useCallback(async () => {
    // ... (fetchBatchFiles logic remains the same as your provided version) ...
    if (!batchIdParam) {
      setFilesError("Batch ID is missing.");
      setIsLoadingFiles(false);
      return;
    }
    if (
      loggedInUser &&
      loggedInUser.role === "student" &&
      loggedInUser.batch?.toString() !== batchIdParam
    ) {
      setFilesError("You do not have permission to view files for this batch.");
      setFiles([]);
      setIsLoadingFiles(false);
      return;
    }

    setIsLoadingFiles(true);
    setFilesError(null);
    try {
      const params: {
        batch_id: number;
        discussion_type_id?: number;
        schedule_id?: number;
      } = { batch_id: parseInt(batchIdParam) };
      if (filterDiscussionTypeId)
        params.discussion_type_id = parseInt(filterDiscussionTypeId);
      if (filterScheduleId) params.schedule_id = parseInt(filterScheduleId);

      const fetchedFiles = await getFiles(params);
      setFiles(fetchedFiles);
    } catch (err: unknown) {
      console.error("Failed to fetch batch files:", err);
      let errorMsg = "Failed to load files for this batch.";
      if (typeof err === "object" && err !== null) {
        const errorObj = err as {
          response?: { status?: number };
          message?: string;
        };
        if (errorObj.response?.status === 403) {
          errorMsg = "You do not have permission to view these files.";
        } else if (errorObj.message) {
          errorMsg = errorObj.message;
        }
      }
      setFilesError(errorMsg);
      setFiles([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [batchIdParam, filterDiscussionTypeId, filterScheduleId, loggedInUser]);

  useEffect(() => {
    fetchBatchFiles();
  }, [fetchBatchFiles]);

  const handleDeleteFile = async (fileId: number, fileName: string) => {
    // ... (handleDeleteFile logic remains the same as your provided version) ...
    if (
      window.confirm(
        `Are you sure you want to delete "${fileName}"? This action cannot be undone.`
      )
    ) {
      const toastId = `delete-file-${fileId}`;
      toast.loading("Deleting file...", { id: toastId });
      try {
        await deleteFile(fileId);
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
        toast.success(`File "${fileName}" deleted successfully.`, {
          id: toastId,
        });
      } catch (err: unknown) {
        let errorMessage = `Error deleting "${fileName}".`;
        if (typeof err === "object" && err !== null) {
          const errorObj = err as { response?: { data?: { detail?: string } } };
          if (errorObj.response?.data?.detail) {
            errorMessage = errorObj.response.data.detail;
          }
        }
        toast.error(errorMessage, { id: toastId });
        setFilesError(errorMessage); // Also show in page alert if persistent error is desired
      }
    }
  };

  // --- NEW: Handle programmatic download ---
  const handleDownloadClick = async (
    fileId: number,
    originalFilename: string
  ) => {
    const toastId = `download-${fileId}`;
    toast.loading("Preparing download...", { id: toastId });
    try {
      await downloadFileProgrammatically(fileId, originalFilename);
      toast.success(`Download for "${originalFilename}" started!`, {
        id: toastId,
      });
    } catch (error: unknown) {
      let errorMessage = `Failed to download "${originalFilename}".`;
      if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage =
          (error as { message?: string }).message ||
          `Failed to download "${originalFilename}".`;
      }
      toast.error(errorMessage, { id: toastId });
    }
  };

  const discussionTypeOptions = useMemo(
    () => [
      { value: "", label: "All Discussion Types" },
      ...discussionTypes.map((dt) => ({
        value: dt.id.toString(),
        label: dt.name,
      })),
    ],
    [discussionTypes]
  );

  const getDisplayUploaderName = (
    file: UploadedFileType
  ): string | React.JSX.Element => {
    // ... (This logic remains the same as your provided version) ...
    if (!file.uploader)
      return (
        <span className="italic text-light-text-secondary/80 dark:text-dark-text-secondary/80">
          N/A
        </span>
      );
    if (loggedInUser && file.uploader === loggedInUser.id) {
      return getUserDisplayName(loggedInUser);
    }
    const uploaderUser = loggedInUser?.is_staff
      ? presenterCandidates.find((u) => u.id === file.uploader)
      : null;
    if (uploaderUser) {
      return getUserDisplayName(uploaderUser);
    }
    if (file.uploader_username) {
      const fallback: SimpleUser = {
        id: file.uploader,
        username: file.uploader_username,
        role: "student",
        first_name: "",
        last_name: "",
        batch_id: file.batch ?? null,
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

  const getFileTopicOrDescription = (file: UploadedFileType): string => {
    // ... (This logic remains the same as your provided version) ...
    if (file.schedule_title) return `Topic: ${file.schedule_title}`;
    if (file.description) return file.description;
    return "N/A";
  };

  const canUploadToThisBatch =
    loggedInUser &&
    (loggedInUser.is_staff || loggedInUser.batch?.toString() === batchIdParam);
  const initialDataLoading =
    (appDataIsLoading.batches && !batches.length) ||
    (appDataIsLoading.discussionTypes && !discussionTypes.length);

  if (isLoadingFiles || initialDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Activity
          size={36}
          className="animate-spin text-primary dark:text-primary-light"
        />
        <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Loading Batch Files...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text flex items-center">
            <FolderOpen
              size={28}
              className="mr-3 text-primary dark:text-primary-light"
            />
            Files for{" "}
            {currentBatch?.name ||
              (batchIdParam ? `Batch (ID: ${batchIdParam})` : "Selected Batch")}
          </h1>
          {filterScheduleId && files.length > 0 && files[0].schedule_title && (
            <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Showing files specifically for schedule:{" "}
              <span className="font-medium text-light-text dark:text-dark-text">
                {files[0].schedule_title}
              </span>
            </p>
          )}
        </div>
        {canUploadToThisBatch && (
          <Link
            to={`/upload?batchId=${batchIdParam || loggedInUser?.batch || ""}`}
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<UploadCloud size={18} />}
            >
              Upload to this Batch
            </Button>
          </Link>
        )}
      </header>

      {(filesError || appDataError) && (
        <Alert
          type={files.length > 0 ? "warning" : "error"}
          title={files.length > 0 ? "Data Incomplete" : "Error Loading Files"}
          message={
            filesError || appDataError || "An unexpected error occurred."
          }
          onClose={() => {
            setFilesError(null);
            useAppDataStore.setState({ error: null });
          }}
          className="my-4"
        />
      )}

      <Card elevated>
        <CardHeader noBorder className="pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle
              as="h2"
              icon={<Filter size={20} />}
              subTitle="Filter files by discussion type."
            >
              Filter Files
            </CardTitle>
            <div className="w-full md:w-auto md:min-w-[250px] lg:min-w-[300px] pt-2 md:pt-0">
              <Select
                options={discussionTypeOptions}
                value={filterDiscussionTypeId}
                onChange={(e) => {
                  setFilterDiscussionTypeId(e.target.value);
                  if (filterScheduleId && e.target.value)
                    setFilterScheduleId("");
                }}
                aria-label="Filter by discussion type"
                placeholder="All Discussion Types"
                disabled={isLoadingFiles || initialDataLoading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className={files.length > 0 ? "p-0 sm:p-0" : "pt-4"}>
          {isLoadingFiles && files.length === 0 ? (
            <div className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 px-6">
              <FileWarning
                size={56}
                className="mx-auto text-light-text-secondary/40 dark:text-dark-text-secondary/40 mb-4"
              />
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">
                No Files Found
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {filesError
                  ? "Could not load files for this batch."
                  : "No files match your criteria in this batch."}
              </p>
              {canUploadToThisBatch && (
                <Link
                  to={`/upload?batchId=${
                    batchIdParam || loggedInUser?.batch || ""
                  }`}
                  className="mt-6"
                >
                  <Button
                    variant="outline"
                    leftIcon={<UploadCloud size={16} />}
                  >
                    Upload First File
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto pretty-scrollbar">
              <table className="min-w-full">
                <thead className="bg-light-bg dark:bg-dark-bg sticky top-0 z-[1]">
                  <tr>
                    <th className="table-th text-left pl-6">Filename</th>
                    <th className="table-th text-left">Topic / Description</th>
                    <th className="table-th text-left">Type</th>
                    <th className="table-th text-left">Uploaded By</th>
                    <th className="table-th text-left">Date</th>
                    <th className="table-th text-center pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {files.map((file) => (
                    <tr
                      key={file.id}
                      className="group hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-100"
                    >
                      <td className="table-td pl-6 max-w-xs">
                        {/* Filename is now just text, download via button */}
                        <span
                          className="font-medium text-light-text dark:text-dark-text truncate block group-hover:whitespace-normal group-hover:text-primary dark:group-hover:text-primary-light"
                          title={file.original_filename}
                        >
                          {file.original_filename}
                        </span>
                      </td>
                      <td
                        className="table-td-secondary max-w-sm truncate group-hover:whitespace-normal"
                        title={getFileTopicOrDescription(file)}
                      >
                        {getFileTopicOrDescription(file)}
                      </td>
                      <td className="table-td-secondary">
                        {file.discussion_type_name}
                      </td>
                      <td className="table-td-secondary">
                        {getDisplayUploaderName(file)}
                      </td>
                      <td className="table-td-secondary">
                        {formatDate(file.upload_date)}
                      </td>
                      <td className="table-td text-center pr-6">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDownloadClick(
                                file.id,
                                file.original_filename
                              )
                            }
                            title={`Download ${file.original_filename}`}
                          >
                            <Download size={16} />
                          </Button>
                          {/* Delete Button Logic (same as before) */}
                          {(loggedInUser?.is_staff ||
                            loggedInUser?.id === file.uploader) &&
                            (!loggedInUser.is_staff ||
                              loggedInUser.is_superuser ||
                              loggedInUser.role === "professor" ||
                              (loggedInUser.role === "batch_leader" &&
                                file.batch === loggedInUser.batch) ||
                              loggedInUser.id === file.uploader) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteFile(
                                    file.id,
                                    file.original_filename
                                  )
                                }
                                title="Delete File"
                                className="text-light-text-secondary hover:text-error dark:text-dark-text-secondary dark:hover:text-error"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {files.length > 0 && (
          <CardFooter className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Displaying {files.length} file(s).
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BatchFilesPage;
