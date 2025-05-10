import React from "react";
import { Card, CardContent } from "../ui/Card";
import { type LucideProps } from "lucide-react"; // Assuming lucide-react is installed

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<LucideProps>;
  isAlert?: boolean;
  description?: string; // Optional small description below value
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  isAlert = false,
  description,
  className = "",
}) => {
  return (
    <Card elevated noPadding className={`overflow-hidden ${className}`}>
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-2xl sm:text-3xl font-bold mt-1
              ${
                isAlert && typeof value === "number" && value > 0
                  ? "text-error dark:text-red-400"
                  : "text-light-text dark:text-dark-text"
              }
            `}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
              {description}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-full flex-shrink-0
            ${
              isAlert && typeof value === "number" && value > 0
                ? "bg-error/10 text-error dark:bg-red-500/20 dark:text-red-400"
                : "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light"
            }
          `}
        >
          {React.isValidElement(icon)
            ? React.cloneElement(icon, {
                ...(icon.props || {}),
                size: 20,
                strokeWidth: 2.5,
              })
            : icon}
        </div>
      </CardContent>
    </Card>
  );
};
