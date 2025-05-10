import React from "react";
import { XCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string | React.ReactNode;
  title?: string; // Optional title for the alert
  onClose?: () => void;
  className?: string;
  compact?: boolean; // For a more compact style
}

const alertStyles = {
  success: {
    bg: "bg-green-50 dark:bg-green-600/20", // Adjusted dark bg
    text: "text-green-700 dark:text-green-300",
    iconColor: "text-green-500 dark:text-green-400",
    borderColor: "border-green-300 dark:border-green-500/50",
    Icon: CheckCircle,
  },
  error: {
    bg: "bg-red-50 dark:bg-red-600/20",
    text: "text-red-700 dark:text-red-300",
    iconColor: "text-red-500 dark:text-red-400",
    borderColor: "border-red-300 dark:border-red-500/50",
    Icon: XCircle,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-500/20", // Yellow is tricky in dark mode
    text: "text-yellow-700 dark:text-yellow-200",
    iconColor: "text-yellow-500 dark:text-yellow-300",
    borderColor: "border-yellow-300 dark:border-yellow-500/50",
    Icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-600/20",
    text: "text-blue-700 dark:text-blue-300",
    iconColor: "text-blue-500 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-500/50",
    Icon: Info,
  },
};

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  title,
  onClose,
  className = "",
  compact = false,
}) => {
  const styles = alertStyles[type];
  const IconComponent = styles.Icon;

  return (
    <div
      className={`
        border-l-4 rounded-r-md 
        ${styles.bg} ${styles.borderColor} ${styles.text} 
        flex items-start shadow-md
        ${compact ? "p-3" : "p-4"}
        ${className}
      `}
      role="alert"
    >
      <IconComponent
        size={compact ? 18 : 20}
        className={`mr-3 flex-shrink-0 ${styles.iconColor}`}
        aria-hidden="true"
      />
      <div className="flex-grow text-sm">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md 
                     hover:bg-current/10 
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-current
                     ${styles.text} /* Ensure button color matches alert text for contrast */
                     `}
          aria-label="Dismiss alert"
        >
          <X size={compact ? 16 : 18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
