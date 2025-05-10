import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Info, Users, Database, WifiOff, ShieldCheck } from "lucide-react"; // Added more icons

const AboutAppPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <header className="text-center mb-10">
        <Info
          size={48}
          className="mx-auto text-primary dark:text-primary-light mb-4"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          About PG Document Hub
        </h1>
        <p className="mt-3 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Streamlining Scholarly Submissions for the Department of Materia
          Medica.
        </p>
      </header>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<Database size={22} />} as="h2">
            Purpose & Functionality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary">
          <p>
            The PG Document Hub is a dedicated web application designed to
            simplify the management, storage, and retrieval of academic
            documents for Postgraduate (PG) scholars and faculty within the
            Department of Materia Medica, White Memorial Homoeopathic Medical
            College (WMHMC).
          </p>
          <p>
            It automates the organization of forms, schedules, discussion
            presentations, and other essential documents by batch and date,
            making them easily accessible and securely stored.
          </p>

          <h3 className="text-md font-semibold text-light-text dark:text-dark-text pt-3">
            Key Features:
          </h3>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-primary/90 dark:text-primary-light/90">
                Automated Sorting:
              </strong>{" "}
              Files are automatically organized by batch and date.
            </li>
            <li>
              <strong className="text-primary/90 dark:text-primary-light/90">
                Secure Uploads:
              </strong>{" "}
              PG Scholars can log in and upload their files directly.
            </li>
            <li>
              <strong className="text-primary/90 dark:text-primary-light/90">
                Role-Based Access:
              </strong>{" "}
              Different views and permissions for Students, Batch Leaders, and
              Professors.
            </li>
            <li>
              <strong className="text-primary/90 dark:text-primary-light/90">
                Submission Verification:
              </strong>{" "}
              Tools for Batch Leaders and Professors to track submissions
              against schedules.
            </li>
            <li>
              <strong className="text-primary/90 dark:text-primary-light/90">
                Centralized Repository:
              </strong>{" "}
              All documents stored securely on the department computer.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<ShieldCheck size={22} />} as="h2">
            Access & Hosting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary">
          <div className="flex items-start space-x-3">
            <WifiOff
              size={36}
              className="text-accent dark:text-accent-light mt-1 flex-shrink-0"
            />
            <div>
              <h3 className="text-md font-semibold text-light-text dark:text-dark-text">
                Local Network Access Only
              </h3>
              <p>
                This application is hosted on a dedicated computer within the
                department and is accessible exclusively through the
                department's local Wi-Fi network.
                <strong className="text-light-text dark:text-dark-text">
                  {" "}
                  It is not connected to the public internet.
                </strong>
              </p>
            </div>
          </div>
          <p>
            This local hosting model ensures data privacy and control, aligning
            with the department's operational needs. Regular backups of the
            application data are managed separately to ensure data integrity.
          </p>
        </CardContent>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<Users size={22} />} as="h2">
            Target Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-light-text-secondary dark:text-dark-text-secondary">
          <p>
            <strong className="text-light-text dark:text-dark-text">
              PG Scholars:
            </strong>{" "}
            For submitting their academic work and accessing relevant batch
            documents.
          </p>
          <p>
            <strong className="text-light-text dark:text-dark-text">
              Faculty (Professors & Head of Department):
            </strong>{" "}
            For overseeing submissions, managing schedules, and accessing
            departmental academic records.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutAppPage;
