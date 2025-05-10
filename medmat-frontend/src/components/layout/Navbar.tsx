// src/components/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ThemeToggle } from "../ui/ThemeToggle";
import Button from "../ui/Button";
import {
  LogOut,
  UserCircle,
  LayoutDashboard,
  UploadCloud,
  CalendarDays,
  FolderKanban,
  ListChecks,
  Menu,
  X as CloseIcon,
  ChevronDown,
  type LucideIcon,
  Info,
  UserSquare2, // Ensure LucideIcon type is correctly imported if used in renderNavLink
} from "lucide-react";
import { getUserDisplayName } from "../../utils/userDisplay";

// Import the PNG logo from the src/assets directory
import appLogoSrc from "../../assets/logo.png"; // Adjust path if your assets folder is different

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    navigate("/login");
  };

  const displayName = getUserDisplayName(user);

  const primaryNavLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" }, // Pass component directly
    { to: "/upload", icon: UploadCloud, label: "Upload" },
    { to: "/schedules", icon: CalendarDays, label: "Schedules" },
  ];

  const batchSpecificLink = user?.batch
    ? {
        to: `/batch/${user.batch}/files`,
        icon: FolderKanban,
        label: "My Batch Files",
      }
    : null;

  const staffNavLinks = [
    {
      to: "/manage/schedules",
      icon: CalendarDays,
      label: "Manage Schedules",
      iconClassName: "text-accent dark:text-accent-light",
    },
    {
      to: "/verify-uploads",
      icon: ListChecks,
      label: "Verify Uploads",
      iconClassName: "text-teal-500 dark:text-teal-400",
    },
  ];

  // Updated renderNavLink to accept LucideIcon component directly
  const renderNavLink = (
    link: {
      to: string;
      icon: LucideIcon;
      label: string;
      iconClassName?: string;
    },
    isMobile = false
  ) => {
    const IconComponent = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => {
          if (isMobile) setMobileMenuOpen(false);
        }}
        className={({ isActive }) =>
          `flex items-center px-3 ${
            isMobile ? "py-3 text-base" : "py-2 text-sm"
          } rounded-lg font-medium transition-colors duration-150 ease-in-out group
           hover:bg-primary/10 dark:hover:bg-primary-dark/10 
           ${
             isActive
               ? "bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-light font-semibold"
               : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-light"
           }
           ${isMobile ? "w-full" : ""}`
        }
      >
        <IconComponent
          size={isMobile ? 20 : 18} // Slightly larger icons for mobile
          className={`mr-2.5 group-hover:text-primary dark:group-hover:text-primary-light ${
            link.iconClassName || ""
          }`}
        />
        <span>{link.label}</span>
      </NavLink>
    );
  };

  return (
    <header className="bg-light-bg-alt dark:bg-dark-bg-alt shadow-md sticky top-0 z-[990] print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Name */}
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg-alt rounded-md p-1 -ml-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={appLogoSrc}
              alt="PG Document Hub Logo"
              className="h-8 w-auto sm:h-9 transition-transform duration-200 hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-md sm:text-xl font-bold text-primary dark:text-primary-light tracking-tight">
                PG Document Hub
              </span>
              {/* <span className="text-xs italic text-light-text-secondary dark:text-dark-text-secondary">
                Streamlining Scholarly Submissions.
              </span> */}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {isAuthenticated && (
              <>
                {primaryNavLinks.map((link) => renderNavLink(link))}
                {batchSpecificLink && renderNavLink(batchSpecificLink)}
                {user?.is_staff &&
                  staffNavLinks.map((link) => renderNavLink(link))}
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center text-sm p-1.5 rounded-full hover:bg-light-border dark:hover:bg-dark-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg-alt"
                >
                  <UserCircle
                    size={24}
                    className="text-light-text-secondary dark:text-dark-text-secondary"
                  />
                  <span className="ml-1.5 hidden lg:inline text-light-text-secondary dark:text-dark-text-secondary">
                    {displayName.split(" ")[0] +
                      " " +
                      displayName.split(" ")[1]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`ml-1 text-light-text-secondary dark:text-dark-text-secondary transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 origin-top-right bg-light-bg-alt dark:bg-dark-bg-alt rounded-xl shadow-soft-xl dark:shadow-dark-soft-xl py-2
                               ring-1 ring-light-border dark:ring-dark-border ring-opacity-50 animate-modalShow"
                  >
                    <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                      <p
                        className="text-sm font-semibold text-light-text dark:text-dark-text truncate"
                        title={displayName}
                      >
                        {displayName}
                      </p>
                      <p
                        className="text-xs text-light-text-secondary dark:text-dark-text-secondary truncate"
                        title={user.email || user.username}
                      >
                        {user.email || `Username: ${user.username}`}
                      </p>
                    </div>
                    {/* New Links Here */}
                    <Link
                      to="/about-app"
                      onClick={() => setMobileMenuOpen(false)} // Assuming setMobileMenuOpen exists if this menu is also for mobile
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border hover:text-primary dark:hover:text-primary-light transition-colors"
                    >
                      <Info size={16} className="mr-2.5" />
                      About This App
                    </Link>
                    <Link
                      to="/my-story"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border hover:text-primary dark:hover:text-primary-light transition-colors"
                    >
                      <UserSquare2 size={16} className="mr-2.5" />{" "}
                      {/* Or another relevant icon */}
                      Developer's Story
                    </Link>
                    {/* End New Links */}
                    <div className="my-1 h-px bg-light-border dark:bg-dark-border mx-2"></div>{" "}
                    {/* Separator */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-border dark:hover:bg-dark-border hover:text-error dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut size={16} className="mr-2.5" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link to="/login">
                  <Button variant="primary" size="sm">
                    Login
                  </Button>
                </Link>
              </div>
            )}

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open main menu"
                aria-expanded={mobileMenuOpen}
                className="text-light-text-secondary dark:text-dark-text-secondary"
              >
                {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div
          className="md:hidden absolute top-16 inset-x-0 bg-light-bg-alt dark:bg-dark-bg-alt shadow-lg pb-4 z-[900] border-t border-light-border dark:border-dark-border 
                     origin-top transition-all duration-200 ease-out
                     data-[state=open]:animate-modalShow data-[state=closed]:animate-fadeOut"
          data-state={mobileMenuOpen ? "open" : "closed"}
        >
          <nav className="flex flex-col space-y-1 px-3 pt-3">
            {isAuthenticated && (
              <>
                {primaryNavLinks.map((link) => renderNavLink(link, true))}
                {batchSpecificLink && renderNavLink(batchSpecificLink, true)}
                {user?.is_staff &&
                  staffNavLinks.map((link) => renderNavLink(link, true))}
              </>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="w-full block"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="primary" size="md" className="w-full mt-3">
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
