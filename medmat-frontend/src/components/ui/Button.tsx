import React from "react";
import { Loader2 } from "lucide-react"; // Using a different loader icon

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  asChild?: boolean; // For composition (simplified here)
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  asChild = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap group";
  // Added focus-visible and group

  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary shadow-md hover:shadow-lg dark:shadow-primary/30",
    // Using 'accent' color from theme
    secondary:
      "bg-accent text-white hover:bg-accent-dark focus-visible:ring-accent shadow-md hover:shadow-lg dark:shadow-accent/30",
    outline:
      "border border-primary text-primary hover:bg-primary/10 dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light/10 focus-visible:ring-primary",
    ghost:
      "text-primary hover:bg-primary/10 dark:text-primary-light dark:hover:bg-primary-light/20 focus-visible:ring-primary",
    danger:
      "bg-error text-white hover:bg-red-700 dark:hover:bg-red-500 focus-visible:ring-error shadow-md hover:shadow-lg dark:shadow-error/30",
    // New variant for link-like buttons
    link: "text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
  };

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs h-9", // Slightly adjusted padding/height
    md: "px-5 py-2.5 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
    icon: "h-10 w-10 p-0 text-sm flex-shrink-0", // Ensure flex-shrink-0 for icon buttons in flex containers
  };

  const Comp = asChild ? React.Fragment : "button";

  return (
    <Comp
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <Loader2
          className="animate-spin h-5 w-5"
          // If children exist, add margin, otherwise center loader
          style={{
            marginRight: children || leftIcon || rightIcon ? "0.5rem" : "0",
          }}
        />
      )}
      {leftIcon && !isLoading && (
        <span className={children ? "mr-2" : ""}>{leftIcon}</span>
      )}
      {!isLoading && children}{" "}
      {/* Render children only if not loading, or loader is part of children */}
      {rightIcon && !isLoading && (
        <span className={children ? "ml-2" : ""}>{rightIcon}</span>
      )}
    </Comp>
  );
};

export default Button;
