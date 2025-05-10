import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string; // Title is now optional, header can be custom
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "fit"; // Added more sizes and 'fit'
  hideCloseButton?: boolean;
  className?: string; // For custom styling of the modal panel
  overlayClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement>; // For accessibility
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  hideCloseButton = false,
  className = "",
  overlayClassName = "",
  initialFocusRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
      initialFocusRef?.current?.focus(); // Focus on provided element
      // Trap focus (basic example, more robust solution might be needed for complex modals)
      // const focusableElements = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      // if (focusableElements && focusableElements.length > 0) {
      //   (focusableElements[0] as HTMLElement).focus();
      // }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    fit: "max-w-fit", // For modals that should size to content
  };

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center p-4 
                 bg-black/60 dark:bg-black/70 backdrop-blur-sm 
                 transition-opacity duration-300 ease-out
                 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                 ${overlayClassName}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={`
          bg-light-bg-alt dark:bg-dark-bg-alt 
          rounded-xl shadow-soft-xl dark:shadow-dark-soft-xl
          m-4 w-full 
          ${sizeClasses[size]} 
          transform transition-all duration-300 ease-out 
          ${
            isOpen
              ? "scale-100 opacity-100 animate-modalShow"
              : "scale-95 opacity-0"
          }
          flex flex-col max-h-[calc(100vh-2rem)] /* Ensure modal fits viewport */
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-light-border dark:border-dark-border flex-shrink-0">
            {title && (
              <h3
                id="modal-title"
                className="text-lg font-semibold text-light-text dark:text-dark-text"
              >
                {title}
              </h3>
            )}
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 -m-1.5 rounded-md text-light-text-secondary/70 hover:text-light-text dark:text-dark-text-secondary/70 dark:hover:text-dark-text 
                           hover:bg-light-border/50 dark:hover:bg-dark-border/50 
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
          {" "}
          {/* Scrollable content area */}
          {children}
        </div>
      </div>
    </div>
  );
};
