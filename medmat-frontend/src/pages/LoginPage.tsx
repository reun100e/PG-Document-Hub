import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Select, { type StylesConfig, type SingleValue } from "react-select";
import { useAuth } from "../hooks/useAuth";
import { loginUser, fetchUsernamesForLogin } from "../services/authService";
import type { SimpleUser } from "../types";
import { getUserDisplayName } from "../utils/userDisplay";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import { useThemeStore } from "../store/themeStore";
import { Card, CardContent } from "../components/ui/Card";

interface UsernameOption {
  value: string; // Username (actual value for login)
  label: string; // Formatted display name (e.g., "Dr. John Doe")
}

const LoginPage: React.FC = () => {
  const [selectedUsernameOption, setSelectedUsernameOption] =
    useState<UsernameOption | null>(null);
  const [password, setPassword] = useState("");
  const [usernameOptions, setUsernameOptions] = useState<UsernameOption[]>([]);
  const [usernamesLoading, setUsernamesLoading] = useState(true);
  const [usernamesError, setUsernamesError] = useState<string | null>(null);

  const {
    login,
    isAuthenticated,
    isLoading: authIsLoading,
    error: authError,
    setError: setAuthError,
  } = useAuth();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const loadUsernames = async () => {
      setUsernamesLoading(true);
      setUsernamesError(null);
      try {
        const fetchedSimpleUsers = await fetchUsernamesForLogin();
        setUsernameOptions(
          fetchedSimpleUsers.map((simpleUser: SimpleUser) => ({
            value: simpleUser.username,
            label: getUserDisplayName(simpleUser), // Use formatted display name for label
          }))
        );
      } catch (err) {
        setUsernamesError("Failed to load user list. Please try refreshing.");
        console.error("Failed to load usernames for login:", err);
      } finally {
        setUsernamesLoading(false);
      }
    };
    loadUsernames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsernameOption) {
      setAuthError("Please select your name.");
      return;
    }
    setAuthError(null);

    try {
      const data = await loginUser({
        username: selectedUsernameOption.value,
        password,
      });
      login(data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error("Login attempt failed on page:", err);
      // Error is already set in authStore by loginUser service function
    }
  };

  const selectStyles: StylesConfig<UsernameOption, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor:
        theme === "dark"
          ? "var(--color-dark-bg-alt)"
          : "var(--color-light-bg-alt)", // Using CSS vars or direct hex
      borderColor:
        theme === "dark"
          ? "var(--color-dark-border)"
          : "var(--color-light-border)",
      color:
        theme === "dark" ? "var(--color-dark-text)" : "var(--color-light-text)",
      boxShadow: state.isFocused
        ? `0 0 0 2px ${
            theme === "dark"
              ? "var(--color-primary-light)"
              : "var(--color-primary)"
          }40` // ring-primary/50
        : "none",
      "&:hover": {
        borderColor:
          theme === "dark"
            ? "var(--color-dark-border-hover)"
            : "var(--color-light-border-hover)",
      },
      minHeight: "42px", // from theme
      borderRadius: "0.5rem", // from theme (lg)
      fontSize: "0.875rem", // sm text
    }),
    singleValue: (provided) => ({
      ...provided,
      color:
        theme === "dark" ? "var(--color-dark-text)" : "var(--color-light-text)",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor:
        theme === "dark"
          ? "var(--color-dark-bg-alt)"
          : "var(--color-light-bg-alt)",
      borderColor:
        theme === "dark"
          ? "tailwindTheme.primary.DEFAULT"
          : "var(--color-light-border)",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      boxShadow:
        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", // soft-lg
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? theme === "dark"
          ? "var(--color-primary-dark)"
          : "var(--color-primary)"
        : state.isFocused
        ? theme === "dark"
          ? "var(--color-dark-border)"
          : "var(--color-light-border)"
        : "transparent",
      color: state.isSelected
        ? "white"
        : theme === "dark"
        ? "var(--color-dark-text)"
        : "var(--color-light-text)",
      padding: "0.5rem 1rem",
      "&:active": {
        backgroundColor:
          theme === "dark"
            ? "var(--color-primary)"
            : "var(--color-primary-dark)",
      },
    }),
    input: (provided) => ({
      ...provided,
      color:
        theme === "dark" ? "var(--color-dark-text)" : "var(--color-light-text)",
      margin: "0px",
      paddingTop: "0px",
      paddingBottom: "0px",
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0.125rem 0.5rem", // Adjusted to better align text with native input
    }),
    placeholder: (provided) => ({
      ...provided,
      color:
        theme === "dark"
          ? "var(--color-dark-text-secondary)"
          : "var(--color-light-text-secondary)",
    }),
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8 px-4">
      {" "}
      {/* Adjusted min-height and padding */}
      <Card className="w-full max-w-md" elevated>
        {" "}
        {/* Using Card component with elevation */}
        {/* No explicit CardHeader, title in CardContent or directly */}
        <CardContent className="pt-8">
          {" "}
          {/* Added more top padding */}
          <h2 className="text-2xl font-bold text-center text-light-text dark:text-dark-text mb-2">
            Welcome Doctor
          </h2>
          <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary mb-8">
            Login to Materia Medica PG Document Hub
          </p>
          {usernamesError && (
            <Alert type="error" message={usernamesError} className="mb-6" />
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username-select"
                className="form-label" // Using global form-label style
              ></label>
              <Select<UsernameOption, false> // Renamed to avoid conflict with our Select
                id="username-select"
                instanceId="username-select-instance"
                options={usernameOptions}
                value={selectedUsernameOption}
                onChange={(option: SingleValue<UsernameOption>) =>
                  setSelectedUsernameOption(option)
                }
                isLoading={usernamesLoading}
                isClearable
                isSearchable
                placeholder="Type or select your name..."
                styles={selectStyles}
                noOptionsMessage={() =>
                  usernamesLoading ? "Loading names..." : "No names found"
                }
                aria-live="polite"
                classNamePrefix="react-select"
              />
            </div>

            <Input
              id="password"
              // label="Password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // errorMessage and error props are handled by the Input component now
              error={!!authError} // Pass boolean for visual cue
              errorMessage={authError || undefined}
            />

            {/* Auth error is now displayed by the Input component if errorMessage is passed */}
            {/* Or keep a general alert if needed */}
            {authError && (
              <Alert
                type="error"
                message={authError}
                className="mb-0"
                onClose={() => setAuthError(null)}
              />
            )}

            <Button
              type="submit"
              disabled={
                authIsLoading || usernamesLoading || !selectedUsernameOption
              }
              isLoading={authIsLoading}
              className="w-full"
              size="lg"
            >
              Login
            </Button>
          </form>
        </CardContent>
        {/* Optional: Add CardFooter for links like "Forgot Password?" if ever needed */}
      </Card>
    </div>
  );
};
export default LoginPage;
