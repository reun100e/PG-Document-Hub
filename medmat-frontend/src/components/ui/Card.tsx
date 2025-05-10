// src/components/ui/Card.tsx
import React from "react";

// --- Base Card Component ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType; // Allow rendering as different elements like 'section', 'article'
  elevated?: boolean | "none" | "sm" | "md" | "lg" | "xl"; // More granular shadow control
  noPadding?: boolean; // If true, children are rendered directly without internal padding
  interactive?: boolean; // Adds subtle hover effect if card is clickable (e.g., when wrapped in Link)
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  as: Component = "div", // Default to 'div'
  elevated = "md", // Default to a medium shadow
  noPadding = false,
  interactive = false,
  ...props
}) => {
  const shadowClasses = {
    none: "",
    sm: "shadow-sm dark:shadow-neutral-900/30",
    md: "shadow-soft-lg dark:shadow-dark-soft-lg", // Default from theme
    lg: "shadow-lg dark:shadow-neutral-900/60",
    xl: "shadow-soft-xl dark:shadow-dark-soft-xl", // More pronounced
  };

  return (
    <Component
      className={`
        bg-light-bg-alt dark:bg-dark-bg-alt 
        rounded-xl 
        ${
          shadowClasses[elevated as keyof typeof shadowClasses] ||
          shadowClasses.md
        }
        overflow-hidden 
        transition-all duration-300 ease-in-out
        ${
          interactive
            ? "hover:shadow-xl dark:hover:shadow-dark-soft-xl hover:-translate-y-0.5"
            : ""
        }
        ${className}
      `}
      {...props}
    >
      {noPadding ? children : <div className="p-5 sm:p-6">{children}</div>}
    </Component>
  );
};

// --- Card Header ---
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean; // If true, removes the bottom border
  sticky?: boolean; // If true, makes header sticky (parent needs overflow handling)
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  noBorder = false,
  sticky = false,
  ...props
}) => {
  return (
    <div
      className={`
        px-5 py-4 sm:px-6 sm:py-5
        ${
          !noBorder
            ? "border-b border-light-border dark:border-dark-border"
            : ""
        }
        ${
          sticky
            ? "sticky top-0 z-10 bg-light-bg-alt/80 dark:bg-dark-bg-alt/80 backdrop-blur-sm"
            : ""
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// --- Card Title ---
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  subTitle?: string | React.ReactNode;
  icon?: React.ReactNode; // Optional icon next to the title
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
  as: Component = "h3",
  subTitle,
  icon,
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        {icon && (
          <span className="text-primary dark:text-primary-light flex-shrink-0">
            {icon}
          </span>
        )}
        <Component
          className={`text-lg font-semibold text-light-text dark:text-dark-text ${className}`}
          {...props}
        >
          {children}
        </Component>
      </div>
      {subTitle && (
        <p
          className={`mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary ${
            icon ? "ml-calculated-icon-spacing" : ""
          }`}
        >
          {" "}
          {/* Adjust margin if icon exists */}
          {subTitle}
        </p>
      )}
    </div>
  );
};
// For ml-calculated-icon-spacing, you'd either pass icon size or use a fixed value: e.g., ml-7 if icon+spacing is ~28px

// --- Card Content ---
// This component is useful when Card has `noPadding={true}` and you want padded sections within it.
// Or if you just prefer the semantic grouping.
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  // noVerticalPadding?: boolean;
  // noHorizontalPadding?: boolean;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  // noVerticalPadding,
  // noHorizontalPadding,
  ...props
}) => {
  // const paddingClasses = `
  //   ${noVerticalPadding ? 'py-0' : 'py-4 sm:py-5'}
  //   ${noHorizontalPadding ? 'px-0' : 'px-5 sm:px-6'}
  // `;
  return (
    <div
      className={`px-5 py-4 sm:px-6 sm:py-5 ${className}`} // Default padding
      {...props}
    >
      {children}
    </div>
  );
};

// --- Card Footer ---
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noBorder?: boolean;
  align?: "left" | "center" | "right"; // Alignment of footer content
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  noBorder = false,
  align = "right", // Default to right-align for actions
  ...props
}) => {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div
      className={`
        px-5 py-3 sm:px-6 sm:py-4 
        ${
          !noBorder
            ? "border-t border-light-border dark:border-dark-border"
            : ""
        }
        bg-light-bg/30 dark:bg-dark-bg/20  /* Slightly different footer background */
        flex items-center space-x-3 ${alignmentClasses[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
