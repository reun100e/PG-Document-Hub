import React from "react";

interface StatusBadgeProps {
  uploaded: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  uploaded,
  className = "",
}) => {
  return (
    <span
      className={`
        mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold 
        ${
          uploaded
            ? "bg-success/10 text-success dark:bg-green-500/20 dark:text-green-400"
            : "bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400"
        }
        ${className}
      `}
    >
      <span
        className={`mr-1.5 h-2 w-2 rounded-full 
          ${
            uploaded
              ? "bg-success dark:bg-green-400"
              : "bg-error dark:bg-red-400"
          }`}
      ></span>
      {uploaded ? "Uploaded" : "Pending"}
    </span>
  );
};
