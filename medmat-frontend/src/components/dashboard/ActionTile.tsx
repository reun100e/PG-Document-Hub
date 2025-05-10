// src/components/dashboard/ActionTile.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideProps } from "lucide-react";

interface ActionTileProps {
  title: string;
  linkTo: string;
  icon: React.ReactElement<LucideProps>;
  description?: string;
  accent?: boolean;
  className?: string;
}

export const ActionTile: React.FC<ActionTileProps> = ({
  title,
  linkTo,
  icon,
  description,
  accent = false,
  className = "",
}) => {
  return (
    <Link to={linkTo} className={`block group ${className}`}>
      <div
        className={`
          p-5 rounded-xl transition-all duration-300 ease-in-out h-full flex flex-col justify-between
          ${
            accent
              ? "bg-gradient-to-br from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white shadow-soft-lg dark:shadow-primary/40 hover:shadow-soft-xl"
              : "bg-light-bg-alt dark:bg-dark-bg-alt hover:shadow-soft-lg dark:hover:shadow-dark-soft-lg border border-light-border dark:border-dark-border"
          }
        `}
      >
        <div>
          <div
            className={`
              w-11 h-11 rounded-lg flex items-center justify-center mb-3 sm:mb-4
              ${
                accent
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light"
              }
            `}
          >
            {React.cloneElement(icon, { size: 22 })}{" "}
          </div>
          <h3
            className={`text-md font-semibold mb-1
              ${accent ? "text-white" : "text-light-text dark:text-dark-text"}
            `}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`text-xs ${
                accent
                  ? "text-white/80"
                  : "text-light-text-secondary dark:text-dark-text-secondary"
              }`}
            >
              {description}
            </p>
          )}
        </div>
        <p
          className={`text-xs mt-3 font-medium flex items-center
            ${
              accent
                ? "text-white/90 group-hover:text-white"
                : "text-primary dark:text-primary-light group-hover:text-primary-dark dark:group-hover:text-primary"
            }
          `}
        >
          Proceed
          <ArrowRight
            size={14} // This one is fine because you're directly using ArrowRight
            className="inline ml-1.5 group-hover:translate-x-1 transition-transform"
          />
        </p>
      </div>
    </Link>
  );
};
