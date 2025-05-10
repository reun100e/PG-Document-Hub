import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/Card";
import { User, Edit3, HardDrive, CheckSquare, Heart } from "lucide-react"; // Added icons

const DeveloperStoryPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <header className="text-center mb-10">
        <User
          size={48}
          className="mx-auto text-primary dark:text-primary-light mb-4"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          The Story Behind This App
        </h1>
        <p className="mt-3 text-lg text-light-text-secondary dark:text-dark-text-secondary">
          By Dr. Aghosh B Prasad
        </p>
      </header>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<Edit3 size={22} />} as="h2">
            The Challenge: A Tedious Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          <p>
            As a PG Scholar in the Department of Materia Medica at White
            Memorial Homoeopathic Medical College, I was entrusted with the
            responsibility of maintaining digital copies of all postgraduate
            discussions, presentations, and various other academic documents.
            This involved collecting files from each individual, meticulously
            copying them to the department computer, and backing them up on an
            external hard disk drive.
          </p>
          <div className="flex items-center space-x-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
            <HardDrive
              size={32}
              className="text-accent dark:text-accent-light flex-shrink-0"
            />
            <p className="italic">
              "It quickly became apparent how tedious and time-consuming this
              manual process was. Ensuring every PG scholar submitted their
              files on time, verifying submissions, and avoiding missed
              documents was a constant administrative overhead."
            </p>
          </div>
        </CardContent>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<CheckSquare size={22} />} as="h2">
            The Solution: Automation for Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          <p>
            To make my life—and subsequently, the department's documentation
            process—easier, I decided to develop this web application. The core
            idea was to create a centralized, user-friendly platform where PG
            scholars could directly upload their files.
          </p>
          <p>
            The system needed to automatically sort and store these documents,
            provide an easy way for faculty and batch leaders to verify
            submissions, and maintain a secure, accessible archive within our
            department's local network.
          </p>
        </CardContent>
      </Card>

      <Card elevated>
        <CardHeader>
          <CardTitle icon={<Heart size={22} />} as="h2">
            A Labor of Love for the Department
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
          <p>
            This "PG Document Hub" is the result of that effort. It's built with
            the specific needs of our department in mind, aiming to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Reduce manual administrative work.</li>
            <li>Improve the reliability of document collection.</li>
            <li>Provide a clear overview of submissions.</li>
            <li>
              Ensure all essential academic materials are centrally stored and
              backed up (via periodic scripts).
            </li>
          </ul>
          <p>
            It's a practical tool born out of a real-world departmental
            challenge, developed with the hope of benefiting all current and
            future PG scholars and faculty of the Department of Materia Medica.
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-xs">
            Connect with me:{" "}
            <a
              href="http://aghosh.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary dark:text-primary-light hover:underline"
            >
              aghosh.in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeveloperStoryPage;
