// src/pages/ScheduleListPage.tsx
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
  CardFooter, // If pagination or other footer actions are needed
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Info,
  // Users, // For "All Batches" or batch icon
  Activity, // For loading
  Filter, // For filter section
  Edit3, // For manage button if combined
} from "lucide-react";
import { getUserDisplayName } from "../utils/userDisplay";

// Re-using formatDate from DashboardPage or define locally
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(
    dateString.includes("T") ? dateString : dateString + "T00:00:00"
  );
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ScheduleListPage: React.FC = () => {
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
    if (loggedInUser?.role === "student" && loggedInUser.batch) {
      return loggedInUser.batch.toString();
    }
    return ""; // Default to "All Active Batches" for staff, or first available for students if no assigned batch
  });

  useEffect(() => {
    if (!batches.length) fetchBatches();
  }, [fetchBatches, batches.length]);

  useEffect(() => {
    const params: { batchId?: number } = {};
    if (filterBatchId) {
      params.batchId = parseInt(filterBatchId);
    }
    fetchSchedules(params);
  }, [fetchSchedules, filterBatchId]);

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
        // Fetch candidates for the currently filtered batch or all if no filter
        // Backend PresenterCandidatesListView handles role=student implicitly
        fetchPresenterCandidates({
          batchId: filterBatchId ? parseInt(filterBatchId) : undefined,
        });
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
    // Staff (not batch leaders fixed to their batch) and unassigned students can see "All Batches"
    if (
      loggedInUser?.is_staff &&
      !(loggedInUser.role === "batch_leader" && loggedInUser.batch)
    ) {
      return [{ value: "", label: "All Active Batches" }, ...options];
    }
    // Students/Batch Leaders tied to a batch see only their batch (or no options if unassigned and not staff)
    if (loggedInUser?.batch) {
      return options.filter(
        (opt) => opt.value === loggedInUser.batch?.toString()
      );
    }
    return [{ value: "", label: "Select a Batch" }, ...options]; // Fallback for unassigned student (should ideally not happen)
  }, [batches, loggedInUser]);

  const getDisplayPresenterName = (schedule: ScheduleType): React.ReactNode => {
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

  const isLoadingPageData =
    appDataIsLoading.schedules || (appDataIsLoading.batches && !batches.length);
  const isLoadingPresentersForDisplay =
    loggedInUser?.is_staff &&
    appDataIsLoading.presenterCandidates &&
    schedules.some(
      (s) =>
        s.presenter && !presenterCandidates.find((pc) => pc.id === s.presenter)
    );

  if (isLoadingPageData && !schedules.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Activity
          size={36}
          className="animate-spin text-primary dark:text-primary-light"
        />
        <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Loading Schedules...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-border dark:border-dark-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text flex items-center">
            <CalendarDays
              size={28}
              className="mr-3 text-primary dark:text-primary-light"
            />
            Discussion Schedules
          </h1>
          <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            View upcoming and past discussion schedules.
          </p>
        </div>
        {loggedInUser?.is_staff && (
          <Link to="/manage/schedules">
            <Button variant="primary" size="md" leftIcon={<Edit3 size={16} />}>
              Manage Schedules
            </Button>
          </Link>
        )}
      </header>

      {appDataError && (
        <Alert
          type={schedules.length > 0 ? "warning" : "error"}
          title={
            schedules.length > 0 ? "Data Incomplete" : "Error Loading Schedules"
          }
          message={appDataError}
          className="my-4"
        />
      )}

      <Card elevated>
        <CardHeader noBorder className="pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle
              as="h2"
              icon={<Filter size={20} />}
              subTitle="Select a batch to view its schedules."
            >
              Filter Schedules
            </CardTitle>
            <div className="w-full md:w-auto md:min-w-[250px] lg:min-w-[300px] pt-2 md:pt-0">
              <Select
                options={batchOptions}
                value={filterBatchId}
                onChange={(e) => setFilterBatchId(e.target.value)}
                aria-label="Filter by batch"
                disabled={
                  (loggedInUser?.role === "student" && !!loggedInUser.batch) ||
                  (loggedInUser?.role === "batch_leader" &&
                    !!loggedInUser.batch) ||
                  isLoadingPageData
                }
                placeholder="Select Batch..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className={schedules.length > 0 ? "p-0 sm:p-0" : "pt-4"}>
          {" "}
          {/* No padding if table takes full width */}
          {isLoadingPageData && schedules.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Activity size={24} className="animate-spin text-primary" />
              <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">
                Fetching schedules...
              </span>
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
                {filterBatchId
                  ? "There are no schedules for the selected batch."
                  : "No schedules available at the moment."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto pretty-scrollbar">
              {" "}
              {/* Added pretty-scrollbar */}
              <table className="min-w-full">
                <thead className="bg-light-bg dark:bg-dark-bg sticky top-0 z-[1]">
                  {" "}
                  {/* Sticky header for table scroll */}
                  <tr>
                    <th className="table-th text-left pl-6">Date</th>
                    <th className="table-th text-left">Topic</th>
                    <th className="table-th text-left">Type</th>
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
                    <th className="table-th text-center pr-6">Status</th>
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
                      <td className="table-td max-w-xs">
                        <span
                          className="block font-medium text-light-text dark:text-dark-text truncate group-hover:whitespace-normal group-hover:text-primary dark:group-hover:text-primary-light"
                          title={schedule.title}
                        >
                          {schedule.title}
                        </span>
                      </td>
                      <td className="table-td-secondary">
                        {schedule.discussion_type_name}
                      </td>
                      <td className="table-td-secondary">
                        {getDisplayPresenterName(schedule)}
                      </td>
                      <td className="table-td-secondary">
                        {schedule.batch_name}
                      </td>
                      <td className="table-td text-center pr-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold 
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {schedules.length > 0 && (
          <CardFooter className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            Displaying {schedules.length} schedule(s).
            {/* Add pagination controls here if needed */}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ScheduleListPage;
