import React from "react";
import type { LucideIcon } from "lucide-react";

type ValidAsElements = "input" | "textarea";

interface BaseFieldProps<T extends ValidAsElements> {
  as?: T;
  label?: string;
  error?: string | boolean;
  errorMessage?: string;
  containerClassName?: string;
  wrapperClassName?: string;
  leftIcon?: React.ReactElement<React.ComponentProps<LucideIcon>>;
  rightIcon?: React.ReactElement<React.ComponentProps<LucideIcon>>;
  className?: string; // User-provided className for the <input> or <textarea> element
  id?: string;
}

// Props for 'input' element, extending standard HTMLInputAttributes
// We OMIT 'rows' because it's not for input, and 'className'/'id' because BaseFieldProps handles them.
type InputSpecificProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "rows" | "className" | "id" // Omit these from the spreadable props
> & {
  rows?: never;
};

// Props for 'textarea' element
// We OMIT 'className'/'id' because BaseFieldProps handles them. 'rows' is specific to textarea.
type TextareaSpecificProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "id" // Omit these from the spreadable props
> & {
  rows?: number;
};

export type InputProps<T extends ValidAsElements = "input"> =
  BaseFieldProps<T> &
    (T extends "input"
      ? InputSpecificProps
      : T extends "textarea"
      ? TextareaSpecificProps
      : never);

function Input<T extends ValidAsElements = "input">({
  as,
  label,
  id,
  error,
  errorMessage,
  className: userProvidedClassName = "", // Destructure user's className
  containerClassName = "",
  wrapperClassName = "",
  leftIcon,
  rightIcon,
  ...props // 'props' now correctly typed and EXCLUDES className, id
}: InputProps<T>): React.ReactElement {
  const RenderComponent = as || "input";

  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = Boolean(error);
  const actualErrorMessage = typeof error === "string" ? error : errorMessage;

  const finalClassName = `
    ${RenderComponent === "textarea" ? "py-2.5" : "h-10"}
    ${leftIcon ? "pl-10 sm:pl-11" : "px-3.5 sm:px-4"}
    ${rightIcon ? "pr-10 sm:pr-11" : "px-3.5 sm:px-4"}
    ${hasError ? "border-error focus:border-error focus:ring-error/50" : ""}
    ${userProvidedClassName} 
    ${RenderComponent === "textarea" ? "min-h-[80px]" : ""}
  `
    .trim()
    .replace(/\s+/g, " "); // Clean up extra spaces

  const commonAriaProps = {
    "aria-invalid": hasError,
    "aria-describedby":
      hasError && actualErrorMessage ? `${inputId}-error` : undefined,
  };

  const renderField = () => {
    if (RenderComponent === "textarea") {
      const { rows, ...restTextareaProps } = props as TextareaSpecificProps; // 'props' doesn't have className/id
      return (
        <textarea
          id={inputId}
          className={finalClassName} // Apply the combined className
          rows={rows}
          {...commonAriaProps}
          {...restTextareaProps}
        />
      );
    } else {
      // 'props' here is InputSpecificProps, doesn't have className/id
      return (
        <input
          id={inputId}
          className={finalClassName} // Apply the combined className
          {...commonAriaProps}
          {...(props as InputSpecificProps)}
        />
      );
    }
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${wrapperClassName}`}>
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            {React.cloneElement(leftIcon, {
              className:
                "h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary",
            })}
          </div>
        )}

        {renderField()}

        {rightIcon && (
          <div
            className={`absolute inset-y-0 right-0 flex items-center pr-3.5 ${
              RenderComponent === "textarea" ? "pt-2.5 self-start" : ""
            }`}
          >
            {React.cloneElement(rightIcon, {
              className:
                "h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary",
            })}
          </div>
        )}
      </div>
      {hasError && actualErrorMessage && (
        <p id={`${inputId}-error`} className="error-message">
          {actualErrorMessage}
        </p>
      )}
    </div>
  );
}

export default Input;
