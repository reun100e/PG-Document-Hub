import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 text-center border-t border-light-border dark:border-dark-border">
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
        PG Document Hub © {currentYear} | Dept. of Materia Medica, WMHMC.
      </p>
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
        Developed by{" "}
        <a
          href="http://aghosh.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary/80 dark:text-primary-light/80 hover:text-primary dark:hover:text-primary-light hover:underline"
        >
          Dr. Aghosh B Prasad
        </a>
        {/* Optional: Links can be very subtle here if needed */}
        <span className="mx-1 select-none">| &lt;</span>
        <Link
          to="/about-app"
          className="hover:underline text-primary/80 dark:text-primary-light/80 hover:text-primary dark:hover:text-primary-light"
        >
          About{" "}
        </Link>
        &gt;
        <span className="mx-1 select-none">•</span>&lt;
        <Link
          to="/my-story"
          className="hover:underline text-primary/80 dark:text-primary-light/80 hover:text-primary dark:hover:text-primary-light"
        >
          {" "}
          Story{" "}
        </Link>
        &gt;
      </p>
    </footer>
  );
};

export default Footer;
