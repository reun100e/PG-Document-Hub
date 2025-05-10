import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
      <h1 className="text-6xl font-bold text-primary dark:text-primary-light mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
