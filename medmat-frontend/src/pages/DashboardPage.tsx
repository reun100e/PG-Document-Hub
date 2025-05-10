// src/pages/DashboardPage.tsx
import React, { useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAppDataStore } from "../services/appDataService";
import type { UploadedFile as UploadedFileType } from "../types";
import { getFiles } from "../services/fileService";
import Alert from "../components/ui/Alert";
import {
  CalendarDays,
  FileText,
  UploadCloud,
  ListChecks,
  Activity,
  AlertCircle,
  BarChart3, // Icon for chart card
} from "lucide-react";
import { getUserDisplayName, getRoleDisplay } from "../utils/userDisplay";
import { ActionTile } from "../components/dashboard/ActionTile";
import { InfoDisplayCard } from "../components/dashboard/InfoDisplayCard";
import { StatCard } from "../components/dashboard/StatCard";
import { StatusBadge } from "../components/dashboard/StatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  // Ensure dateString is treated as local if no timezone info, or specify UTC if it is
  const date = new Date(
    dateString.includes("T") ? dateString : dateString + "T00:00:00"
  );
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DashboardPage: React.FC = () => {
  const { user: loggedInUser } = useAuth();
  const {
    schedules,
    fetchSchedules,
    batches,
    fetchBatches,
    isLoading: appDataIsLoading,
    error: appDataError,
    fetchPresenterCandidates,
  } = useAppDataStore();

  const [recentUploads, setRecentUploads] = React.useState<UploadedFileType[]>(
    []
  );
  const [uploadsLoading, setUploadsLoading] = React.useState(false);

  const displayName = getUserDisplayName(loggedInUser);
  const displayRoleConcept = getRoleDisplay(loggedInUser);

  useEffect(() => {
    if (!loggedInUser) return;
    if (!batches.length) fetchBatches();

    if (loggedInUser.role === "student" && loggedInUser.id) {
      fetchSchedules({
        presenterId: loggedInUser.id,
        batchId: loggedInUser.batch || undefined,
      });
      const fetchRecentStudentUploads = async () => {
        setUploadsLoading(true);
        try {
          const uploads = await getFiles({
            uploader_id: loggedInUser.id,
            ordering: "-upload_date",
          });
          setRecentUploads(uploads.slice(0, 3));
        } catch (err) {
          console.error("Failed to fetch recent uploads:", err);
        } finally {
          setUploadsLoading(false);
        }
      };
      fetchRecentStudentUploads();
    } else if (loggedInUser.role === "batch_leader" && loggedInUser.batch) {
      fetchSchedules({ batchId: loggedInUser.batch });
      // Batch leader might also need presenterCandidates for their batch if they view details often
      fetchPresenterCandidates({ batchId: loggedInUser.batch });
    } else if (loggedInUser.is_staff) {
      fetchSchedules({});
      fetchPresenterCandidates({}); // Staff might view details across batches
    }
  }, [
    loggedInUser,
    fetchSchedules,
    fetchBatches,
    batches.length,
    fetchPresenterCandidates,
  ]);

  const upcomingPresentations = useMemo(() => {
    if (loggedInUser?.role !== "student" || !loggedInUser.id) return [];
    const today = new Date().toISOString().split("T")[0];
    return schedules
      .filter(
        (s) => s.presenter === loggedInUser.id && s.scheduled_date >= today
      )
      .sort(
        (a, b) =>
          new Date(a.scheduled_date).getTime() -
          new Date(b.scheduled_date).getTime()
      )
      .slice(0, 3);
  }, [schedules, loggedInUser]);

  const batchLeaderStats = useMemo(() => {
    if (loggedInUser?.role !== "batch_leader" || !loggedInUser.batch)
      return null;
    const today = new Date();
    const currentBatchSchedules = schedules.filter(
      (s) => s.batch === loggedInUser.batch
    );

    const upcomingThisMonth = currentBatchSchedules.filter((s) => {
      const schedDate = new Date(
        s.scheduled_date.includes("T")
          ? s.scheduled_date
          : s.scheduled_date + "T00:00:00"
      );
      return (
        schedDate >= today &&
        schedDate.getMonth() === today.getMonth() &&
        schedDate.getFullYear() === today.getFullYear()
      );
    }).length;

    const pendingSubmissionsOverall = currentBatchSchedules.filter(
      (s) => !s.is_submission_uploaded
    ).length;
    const batchName =
      batches.find((b) => b.id === loggedInUser.batch)?.name || "Your Batch";
    // To get totalStudents, you'd need to fetch users for this batch:
    // const totalStudents = presenterCandidates.filter(pc => pc.batch_id === loggedInUser.batch && pc.role === 'student').length;
    const totalStudents = "N/A"; // Placeholder until user fetching for batch members is robust

    return {
      upcomingThisMonth,
      pendingSubmissionsOverall,
      batchName,
      totalStudents,
    };
  }, [schedules, loggedInUser, batches]);

  const adminProfessorChartData = useMemo(() => {
    if (!loggedInUser?.is_staff || loggedInUser.role === "batch_leader")
      return []; // Exclude batch leaders from this specific chart
    const dataByBatch: { name: string; scheduled: number; pending: number }[] =
      [];
    batches
      .filter((b) => b.is_active)
      .forEach((batch) => {
        const batchSchedules = schedules.filter((s) => s.batch === batch.id);
        if (batchSchedules.length > 0) {
          // Only include batches with schedules
          dataByBatch.push({
            name: batch.name.replace(" Batch", "").replace(" batch", ""),
            scheduled: batchSchedules.length,
            pending: batchSchedules.filter((s) => !s.is_submission_uploaded)
              .length,
          });
        }
      });
    return dataByBatch.sort((a, b) => b.scheduled - a.scheduled).slice(0, 5);
  }, [schedules, batches, loggedInUser]);

  if (
    !loggedInUser ||
    (appDataIsLoading.schedules && !schedules.length) ||
    (appDataIsLoading.batches && !batches.length && loggedInUser.is_staff)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Activity
          size={36}
          className="animate-spin text-primary dark:text-primary-light"
        />
        <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          Welcome,{" "}
          <span className="text-primary dark:text-primary-light">
            {displayName}!
          </span>
        </h1>
        <p className="mt-1 text-md text-light-text-secondary dark:text-dark-text-secondary">
          {displayRoleConcept}
          {loggedInUser.batch_name && (
            <span className="mx-1.5 text-gray-400 dark:text-gray-600">•</span>
          )}
          {loggedInUser.batch_name &&
            `Batch of ${loggedInUser.batch_name.split(" ")[0]}`}
        </p>
      </header>

      {appDataError && (
        <Alert
          type="error"
          title="Data Loading Error"
          message={`Could not load some dashboard data: ${appDataError}`}
          className="mb-6"
        />
      )}

      {/* Quick Actions Tiles */}
      <section>
        <h2 className="sr-only">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          <ActionTile
            title="Upload File"
            linkTo="/upload"
            icon={<UploadCloud />}
          />
          <ActionTile
            title="View Schedules"
            linkTo="/schedules"
            icon={<CalendarDays />}
          />
          {loggedInUser.is_staff && (
            <ActionTile
              title="Manage Schedules"
              linkTo="/manage/schedules"
              icon={<CalendarDays />}
              accent
            />
          )}
          {loggedInUser.is_staff && (
            <ActionTile
              title="Verify Uploads"
              linkTo="/verify-uploads"
              icon={<ListChecks />}
              accent
            />
          )}
        </div>
      </section>

      {/* Student Dashboard */}
      {loggedInUser.role === "student" && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-3 mb-5">
            Your Focus
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoDisplayCard
              title="Upcoming Presentations"
              icon={<CalendarDays />}
              actionLink={{ to: "/schedules", label: "View all schedules" }}
            >
              {upcomingPresentations.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 pretty-scrollbar">
                  {" "}
                  {/* Added pretty-scrollbar class */}
                  {upcomingPresentations.map((s) => (
                    <li
                      key={s.id}
                      className="p-3.5 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-light-text dark:text-dark-text">
                        {s.title}
                      </h4>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {formatDate(s.scheduled_date)} •{" "}
                        {s.discussion_type_name}
                      </p>
                      <StatusBadge uploaded={s.is_submission_uploaded} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary py-4 text-center">
                  No upcoming presentations found.
                </p>
              )}
            </InfoDisplayCard>
            <InfoDisplayCard
              title="Recent Uploads"
              icon={<FileText />}
              actionLink={
                loggedInUser.batch
                  ? {
                      to: `/batch/${loggedInUser.batch}/files`,
                      label: "View batch files",
                    }
                  : undefined
              }
            >
              {uploadsLoading ? (
                <p className="text-sm animate-subtle-pulse py-4 text-center">
                  Loading uploads...
                </p>
              ) : recentUploads.length > 0 ? (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 pretty-scrollbar">
                  {recentUploads.map((file) => (
                    <li
                      key={file.id}
                      className="p-3.5 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
                    >
                      <p
                        className="font-medium text-light-text dark:text-dark-text truncate"
                        title={file.original_filename}
                      >
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Uploaded: {formatDate(file.upload_date.split("T")[0])}
                      </p>
                      {file.schedule_title && (
                        <p className="text-xs text-light-text-secondary/80 dark:text-dark-text-secondary/80 mt-0.5">
                          For: {file.schedule_title}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary py-4 text-center">
                  No recent uploads.
                </p>
              )}
            </InfoDisplayCard>
          </div>
        </section>
      )}

      {/* Batch Leader Dashboard */}
      {loggedInUser.role === "batch_leader" && batchLeaderStats && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-3 mb-5">
            {batchLeaderStats.batchName} Snapshot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Upcoming This Month"
              value={batchLeaderStats.upcomingThisMonth}
              icon={<CalendarDays />}
              description="Scheduled discussions"
            />
            <StatCard
              title="Pending Submissions"
              value={batchLeaderStats.pendingSubmissionsOverall}
              icon={<AlertCircle />}
              isAlert={batchLeaderStats.pendingSubmissionsOverall > 0}
              description="For all schedules"
            />
          </div>
        </section>
      )}

      {/* Professor/Admin Dashboard */}
      {(loggedInUser.role === "professor" ||
        (loggedInUser.is_staff && loggedInUser.role !== "batch_leader")) && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-3 mb-5">
            Department Activity Overview
          </h2>
          {adminProfessorChartData.length > 0 ? (
            <InfoDisplayCard
              title="Schedule Status by Active Batch"
              icon={<BarChart3 />}
            >
              <div className="h-80 md:h-96 -ml-4 pr-1">
                {" "}
                {/* Negative margin for recharts, pr-1 to avoid cutting off y-axis labels */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={adminProfessorChartData}
                    margin={{ top: 5, right: 20, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-light-border)"
                      className="dark:!stroke-[var(--color-dark-border)]"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: "var(--color-light-text-secondary)",
                        fontSize: 11,
                      }}
                      angle={-25}
                      textAnchor="end"
                      height={50}
                      interval={0}
                      className="dark:!fill-[var(--color-dark-text-secondary)]"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "var(--color-light-text-secondary)",
                        fontSize: 11,
                      }}
                      className="dark:!fill-[var(--color-dark-text-secondary)]"
                    />
                    <Tooltip
                      cursor={{
                        fill: "var(--color-light-border)",
                        opacity: 0.5,
                      }}
                      contentStyle={{
                        backgroundColor: "var(--color-light-bg-alt)",
                        borderColor: "var(--color-light-border)",
                        borderRadius: "0.5rem",
                        boxShadow: "var(--shadow-soft-lg)",
                      }}
                      labelStyle={{
                        color: "var(--color-light-text)",
                        fontWeight: "600",
                        marginBottom: "0.25rem",
                        display: "block",
                      }}
                      itemStyle={{ color: "var(--color-light-text-secondary)" }}
                      wrapperClassName="!text-xs dark:!bg-dark-bg-alt dark:!border-dark-border dark:[&_.recharts-tooltip-item]:!text-dark-text-secondary dark:[&_.recharts-tooltip-label]:!text-dark-text"
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: "0.75rem",
                        paddingTop: "10px",
                        paddingBottom: "0px",
                      }}
                      iconSize={10}
                    />
                    <Bar
                      dataKey="scheduled"
                      fill="var(--color-primary)"
                      name="Total Scheduled"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="pending"
                      fill="var(--color-accent)"
                      name="Pending Uploads"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </InfoDisplayCard>
          ) : (
            <InfoDisplayCard title="Department Activity" icon={<BarChart3 />}>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary py-4 text-center">
                No schedule data available to display chart.
              </p>
            </InfoDisplayCard>
          )}
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
