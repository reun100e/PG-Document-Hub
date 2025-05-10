// src/pages/VerificationPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { useAppDataStore } from "../services/appDataService";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import type { Schedule as ScheduleType, SimpleUser } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import {
  CheckCircle,
  XCircle,
  Info,
  ListChecks, // Page title icon
  Filter, // Filter section icon
  ExternalLink, // For "View Files" link
  Activity, // Loading
} from "lucide-react";
import { getUserDisplayName } from "../utils/userDisplay";

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

const VerificationPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const {
    schedules,
    fetchSchedules,
    batches,
    fetchBatches,
    presenterCandidates,
    fetchPresenterCandidates,
    isLoading: appDataIsLoading,
    error: appDataError,
  } = useAppDataStore();

  const [filterBatchId, setFilterBatchId] = useState<string>(() => {
    if (loggedInUser?.role === "batch_leader" && loggedInUser.batch) {
      return loggedInUser.batch.toString();
    }
    return ""; // Default to "All Batches" for Professors/Admins
  });
  const [filterStatus, setFilterStatus] = useState<
    "all" | "uploaded" | "pending"
  >("all");

  useEffect(() => {
    if (!batches.length) fetchBatches();
  }, [fetchBatches, batches.length]);

  useEffect(() => {
    const params: { batchId?: number } = {};
    if (filterBatchId) {
      params.batchId = parseInt(filterBatchId);
    } else if (loggedInUser?.role === "batch_leader" && loggedInUser.batch) {
      // Ensure batch leader always has their batch filter applied if "All Batches" isn't an option for them
      params.batchId = loggedInUser.batch;
    }
    fetchSchedules(params);
  }, [fetchSchedules, filterBatchId, loggedInUser]);

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
        if (filterBatchId) fetchParams.batchId = parseInt(filterBatchId);
        else if (loggedInUser.role === "batch_leader" && loggedInUser.batch)
          fetchParams.batchId = loggedInUser.batch;
        fetchPresenterCandidates(fetchParams);
      }
    }
  }, [
    loggedInUser,
    schedules,
    presenterCandidates,
    fetchPresenterCandidates,
    filterBatchId,
  ]);

  const batchOptions = useMemo(() => {
    const options = batches.map((b) => ({
      value: b.id.toString(),
      label: b.name,
    }));
    if (
      loggedInUser?.is_staff &&
      !(loggedInUser.role === "batch_leader" && loggedInUser.batch)
    ) {
      return [{ value: "", label: "All Active Batches" }, ...options];
    }
    if (loggedInUser?.batch) {
      // Batch leaders and students fixed to their batch (if any)
      return options.filter(
        (opt) => opt.value === loggedInUser.batch?.toString()
      );
    }
    return [{ value: "", label: "Select a Batch" }, ...options]; // Should ideally not be reached by non-staff
  }, [batches, loggedInUser]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "uploaded", label: "Uploaded Only" },
    { value: "pending", label: "Pending Upload Only" },
  ];

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (filterStatus === "uploaded") return schedule.is_submission_uploaded;
      if (filterStatus === "pending") return !schedule.is_submission_uploaded;
      return true; // 'all'
    });
  }, [schedules, filterStatus]);

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

  const isLoadingPage =
    (appDataIsLoading.schedules || appDataIsLoading.batches) &&
    !filteredSchedules.length;
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
          Loading Verification Data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text flex items-center">
            <ListChecks
              size={28}
              className="mr-3 text-primary dark:text-primary-light"
            />
            Verify Upload Status
          </h1>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Check if files have been submitted for scheduled discussions.
          </p>
        </div>
      </header>

      {appDataError && (
        <Alert
          type={filteredSchedules.length > 0 ? "warning" : "error"}
          title={
            filteredSchedules.length > 0
              ? "Data Incomplete"
              : "Error Loading Data"
          }
          message={appDataError}
          className="my-4"
        />
      )}

      <Card elevated>
        <CardHeader noBorder className="pb-2">
          {" "}
          {/* Reduced bottom padding for filter section */}
          <CardTitle
            as="h2"
            icon={<Filter size={20} />}
            subTitle="Filter schedules to verify submissions."
          >
            Filter Submissions
          </CardTitle>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filter by Batch"
              options={batchOptions}
              value={filterBatchId}
              onChange={(e) => setFilterBatchId(e.target.value)}
              disabled={
                (loggedInUser?.role === "batch_leader" &&
                  !!loggedInUser.batch) ||
                isLoadingPage
              }
              placeholder="Select Batch..."
            />
            <Select
              label="Filter by Upload Status"
              options={statusOptions}
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "uploaded" | "pending"
                )
              }
              disabled={isLoadingPage}
            />
          </div>
        </CardHeader>
        <CardContent
          className={filteredSchedules.length > 0 ? "p-0 sm:p-0" : "pt-4"}
        >
          {isLoadingPage && filteredSchedules.length === 0 ? (
            <div className="text-center py-10 text-light-text-secondary dark:text-dark-text-secondary">
              Loading filtered schedules...
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12 px-6">
              <Info
                size={56}
                className="mx-auto text-light-text-secondary/40 dark:text-dark-text-secondary/40 mb-4"
              />
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">
                No Schedules Match
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pretty-scrollbar">
              <table className="min-w-full">
                <thead className="bg-light-bg dark:bg-dark-bg sticky top-0 z-[1]">
                  <tr>
                    <th className="table-th text-left pl-6">Date</th>
                    <th className="table-th text-left">Topic</th>
                    <th className="table-th text-left">
                      Presenter{" "}
                      {isLoadingPresentersForDisplay && (
                        <Activity
                          size={14}
                          className="inline animate-spin ml-1"
                        />
                      )}
                    </th>
                    <th className="table-th text-left">Batch</th>
                    <th className="table-th text-center">Upload Status</th>
                    <th className="table-th text-center pr-6">View Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredSchedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="group hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-100"
                    >
                      <td className="table-td pl-6">
                        {formatDate(schedule.scheduled_date)}
                      </td>
                      <td className="table-td max-w-xs">
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
                        {getDisplayPresenterName(schedule)}
                      </td>
                      <td className="table-td-secondary">
                        {schedule.batch_name}
                      </td>
                      <td className="table-td text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold 
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
                        {schedule.is_submission_uploaded ? (
                          <Link
                            to={`/batch/${schedule.batch}/files?schedule_id=${schedule.id}`}
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
                            title="View submitted files for this schedule"
                          >
                            View Files{" "}
                            <ExternalLink size={14} className="ml-1.5" />
                          </Link>
                        ) : (
                          <span className="text-sm text-light-text-secondary/70 dark:text-dark-text-secondary/70">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {filteredSchedules.length > 0 && (
          <CardFooter className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Displaying {filteredSchedules.length} schedule(s) based on current
            filters.
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

// Ensure table cell styles (.table-th, .table-td, .table-td-secondary) and .pretty-scrollbar are in src/index.css

export default VerificationPage;
