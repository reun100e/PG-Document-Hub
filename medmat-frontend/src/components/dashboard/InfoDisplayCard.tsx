import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/Card"; // Assuming Card components are in ui/
import { Link } from "react-router-dom";
import { type LucideProps } from "lucide-react"; // Assuming lucide-react is installed

interface InfoDisplayCardProps {
  title: string;
  icon: React.ReactElement<LucideProps>;
  children: React.ReactNode;
  actionLink?: { to: string; label: string };
  className?: string;
}

export const InfoDisplayCard: React.FC<InfoDisplayCardProps> = ({
  title,
  icon,
  children,
  actionLink,
  className = "",
}) => {
  return (
    <Card elevated noPadding className={`flex flex-col ${className}`}>
      <CardHeader noBorder className="flex items-center space-x-3">
        <div className="p-2.5 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-light rounded-lg">
          {React.cloneElement(icon, {
            size: 20,
            strokeWidth: 2,
          })}
        </div>
        <CardTitle as="h2" className="text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-5 flex-grow">{children}</CardContent>
      {actionLink && (
        <CardFooter noBorder className="pt-0">
          <Link
            to={actionLink.to}
            className="text-sm font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary transition-colors"
          >
            {actionLink.label} →
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
