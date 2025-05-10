import React from "react";
import { X as ClearIcon, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string | boolean;
  errorMessage?: string;
  containerClassName?: string;
  placeholder?: string;
  isClearable?: boolean;
  value: string | number | readonly string[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  wrapperClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  options,
  error,
  errorMessage,
  className = "",
  containerClassName = "",
  placeholder,
  isClearable = false,
  value,
  onChange,
  disabled,
  wrapperClassName = "",
  ...props
}) => {
  const selectId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = Boolean(error);
  const actualErrorMessage = typeof error === "string" ? error : errorMessage;

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
  };

  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className={`relative flex items-center ${wrapperClassName}`}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          // Uses base styles from index.css by default
          className={`
            pr-10 sm:pr-12 /* Space for custom clear and default arrow */
            ${
              hasError
                ? "border-error focus:border-error focus:ring-error/50"
                : ""
            }
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError && actualErrorMessage ? `${selectId}-error` : undefined
          }
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom clear button */}
        {isClearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-8 sm:pr-10  /* Position before default arrow */
                       text-light-text-secondary/70 hover:text-light-text dark:text-dark-text-secondary/70 dark:hover:text-dark-text
                       focus:outline-none z-10" // z-10 to be above select
            aria-label="Clear selection"
          >
            <ClearIcon size={16} />
          </button>
        )}
        {/* Default browser dropdown arrow is usually sufficient. 
             If a custom arrow is desired, it'd be positioned here and default arrow hidden via 'appearance-none' + custom arrow.
             For now, rely on browser default. Tailwind forms plugin might also style this.
         */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-light-text-secondary dark:text-dark-text-secondary">
          <ChevronDown size={18} />
        </div>
      </div>
      {hasError && actualErrorMessage && (
        <p id={`${selectId}-error`} className="error-message">
          {actualErrorMessage}
        </p>
      )}
    </div>
  );
};

export default Select;
