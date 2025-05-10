# PG Document Hub - Department of Materia Medica, WMHMC

## Overview

The PG Document Hub is a web application designed to streamline the management, storage, and retrieval of academic documents for Postgraduate (PG) scholars and faculty within the Department of Materia Medica at White Memorial Homoeopathic Medical College (WMHMC). It provides a centralized platform for uploading, organizing (by batch and date), and verifying submissions like discussion presentations, forms, and schedules.

This application is intended for deployment on a local department computer, accessible via the local Wi-Fi network only, ensuring data privacy and control.

---
<img src="https://github.com/user-attachments/assets/bf313ff7-40e2-4af4-a039-a0c242bd6fd1" width="200" />
<img src="https://github.com/user-attachments/assets/e0534f5c-fd1b-4f65-9557-e656e8de671a" width="200" />
<img src="https://github.com/user-attachments/assets/f24d48cf-7d26-4992-b4ab-6355ea393712" width="200" />
<img src="https://github.com/user-attachments/assets/c30edbf9-10a7-4bdf-a74d-30dee324ce53" width="200" />
<img src="https://github.com/user-attachments/assets/166cc0a5-fc5e-4131-850b-a5d95989ecec" width="800" />

---


## Features

*   **Secure User Authentication:** Login system for PG Scholars (Students, Batch Leaders) and Faculty (Professors, Admins).
*   **Role-Based Access Control:** Different views and permissions tailored to user roles.
*   **File Upload & Management:** Easy uploading of documents (PDFs, PowerPoints, etc.).
*   **Automatic Organization:** Files are automatically sorted into a structured folder system based on batch, discussion type, and date.
*   **Schedule Management:** Staff can create, update, and manage discussion schedules.
*   **Submission Verification:** Tools for Batch Leaders and Professors to track if files have been submitted for scheduled discussions.
*   **Centralized Repository:** All documents are stored on the department's designated computer.
*   **Responsive UI:** Modern, user-friendly interface accessible on desktop and mobile devices.
*   **Dark/Light Theme:** User-preference for interface theme.
*   **PWA Enabled:** Installable as a standalone web application on supported devices for an app-like experience.

---

## Tech Stack

*   **Backend:**
    *   Python
    *   Django
    *   Django REST Framework (for API)
    *   Waitress (Production WSGI Server for Windows)
    *   WhiteNoise (Static file serving)
    *   Database: SQLite (default for ease of setup, PostgreSQL recommended for larger scale)
*   **Frontend:**
    *   React (with Vite)
    *   TypeScript
    *   Tailwind CSS (Styling)
    *   Zustand (State Management)
    *   React Router (Navigation)
    *   Axios (API communication)
    *   `vite-plugin-pwa` (Progressive Web App features)
*   **Deployment (Local Network):**
    *   Windows 11
    *   Windows Task Scheduler (for auto-start and process management)

---

## Prerequisites

Before you begin, ensure you have the following installed on the machine where you intend to run/deploy the application:

*   **Python:** Version 3.8 or higher (check with `python --version`).
*   **Node.js and npm:** For the React frontend (check with `node -v` and `npm -v`). LTS version recommended.
*   **Git:** For cloning the repository (check with `git --version`).
*   **A Code Editor:** Such as VS Code, Sublime Text, etc.

---

## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/reun100e/PG-Document-Hub.git
    cd PG-Document-Hub
    ```

2.  **Backend Setup (Django):**
    *   Navigate to the backend project directory (e.g., `medmat_project`):
        ```bash
        cd medmat_project
        ```
    *   Create and activate a Python virtual environment:
        ```bash
        python -m venv venv
        # On Windows:
        .\venv\Scripts\activate
        # On macOS/Linux:
        # source venv/bin/activate
        ```
    *   Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Apply database migrations:
        ```bash
        python manage.py migrate
        ```
    *   Create a superuser account (for accessing Django Admin and initial setup):
        ```bash
        python manage.py createsuperuser
        ```
        Follow the prompts to set a username, email (optional), and password.
    *   **Configure `settings.py`:**
        *   Open `medmat_project/medmat_project/settings.py`.
        *   Set `SECRET_KEY` to a new, unique, strong random string.
        *   For development, `DEBUG = True` is fine. For deployment, set `DEBUG = False`.
        *   If `DEBUG = False`, configure `ALLOWED_HOSTS`. Example:
            `ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'YOUR_SERVER_IP_ADDRESS']`

3.  **Frontend Setup (React):**
    *   Navigate to the frontend project directory (e.g., `medmat-frontend`):
        ```bash
        cd ../medmat-frontend 
        ```
    *   Install Node.js dependencies:
        ```bash
        npm install
        ```

---

## Running for Development

You'll typically run the backend and frontend servers separately in development.

1.  **Start the Django Backend Development Server:**
    *   Ensure your Python virtual environment is activated.
    *   Navigate to the Django project directory (`medmat_project`).
    *   In `settings.py`, ensure `DEBUG = True`.
    *   Run:
        ```bash
        python manage.py runserver
        ```
        The backend will usually start on `http://127.0.0.1:8000/`.

2.  **Start the React Frontend Development Server:**
    *   Open a new terminal.
    *   Navigate to the frontend project directory (`medmat-frontend`).
    *   Run:
        ```bash
        npm run dev
        ```
        The frontend will usually start on `http://localhost:5173/` (Vite's default) and will proxy API requests to the Django backend (as configured in `vite.config.ts`).

3.  Access the application in your browser, typically at `http://localhost:5173/`.

---

## Building for Production

1.  **Build the React Frontend:**
    *   Navigate to the frontend project directory (`medmat-frontend`).
    *   Ensure `vite.config.ts` has `base: '/static/'` uncommented if deploying with Django/WhiteNoise where `STATIC_URL = '/static/'`.
    *   Run:
        ```bash
        npm run build
        ```
        This creates an optimized `dist` folder inside `medmat-frontend`.

2.  **Prepare Django for Production:**
    *   Navigate to the Django project directory (`medmat_project`).
    *   Ensure your Python virtual environment is activated.
    *   In `medmat_project/medmat_project/settings.py`:
        *   Set `DEBUG = False`.
        *   Verify `ALLOWED_HOSTS` includes the IP address or hostname of the deployment machine.
        *   Ensure `SECRET_KEY` is set and secure.
    *   Collect static files (this gathers Django admin static files and your React build assets):
        ```bash
        python manage.py collectstatic --noinput
        ```
        This will copy files into the directory specified by `STATIC_ROOT` (e.g., `staticfiles_build/static`).

---

## Deployment (Local Network on Windows 11 with Waitress)

This setup uses Waitress to serve the Django application and WhiteNoise to serve static files (including the React build). Windows Task Scheduler manages auto-start and reliability.

1.  **Prerequisites on Deployment Machine:**
    *   Python installed.
    *   The project code (including the frontend `dist` folder and backend `staticfiles_build` folder after running build steps).

2.  **Setup Environment on Deployment Machine:**
    *   Copy the entire project to a directory (e.g., `C:\apps\pg_document_hub`).
    *   Create and activate a Python virtual environment within this directory.
    *   Install Python dependencies: `pip install -r medmat_project\requirements.txt` (ensure `waitress` and `whitenoise` are in it).

3.  **Configure Windows Firewall:**
    *   Allow inbound traffic on the port you'll use (e.g., TCP port 8000). (See detailed steps in previous deployment guide).

4.  **Create `run_server.bat` Script:**
    *   In your main project directory (e.g., `C:\apps\pg_document_hub`), create `run_server.bat`:
        ```batch
        @echo off
        REM Script to start the PG Document Hub Django application using Waitress

        SET "PROJECT_ROOT_DIR=C:\apps\pg_document_hub"
        SET "DJANGO_PROJECT_DIR=%PROJECT_ROOT_DIR%\medmat_project"
        SET "VENV_ACTIVATE=%PROJECT_ROOT_DIR%\venv\Scripts\activate.bat"
        SET "LOG_DIR=%PROJECT_ROOT_DIR%\logs"

        SET "HOST=0.0.0.0"
        SET "PORT=8000"

        IF NOT EXIST "%LOG_DIR%" MKDIR "%LOG_DIR%"
        SET "LOG_FILE=%LOG_DIR%\server_output.log"

        ECHO Starting PG Document Hub... >> "%LOG_FILE%"
        echo Timestamp: %date% %time% >> "%LOG_FILE%"

        CALL "%VENV_ACTIVATE%"
        cd /d "%DJANGO_PROJECT_DIR%"

        REM Adjust --threads as needed, e.g., --threads=10
        echo Starting Waitress server on %HOST%:%PORT% >> "%LOG_FILE%"
        waitress-serve --host=%HOST% --port=%PORT% medmat_project.wsgi:application >> "%LOG_FILE%" 2>&1
        ```
    *   **Important:** Adjust `PROJECT_ROOT_DIR` path if necessary.

5.  **Configure Windows Task Scheduler:**
    *   Create a new task (e.g., "PGDocHubServer").
    *   **Trigger:** "When the computer starts".
    *   **Action:** "Start a program", Program/script: `C:\apps\pg_document_hub\run_server.bat`.
    *   **General Tab:**
        *   "Run whether user is logged on or not".
        *   "Run with highest privileges".
        *   Set "Configure for:" to Windows 10 or later.
        *   Change User to `SYSTEM` or a local admin account.
    *   **Settings Tab:** Configure restart options (e.g., "If the task fails, restart every: 1 minute", "Attempt to restart up to: 5 times").
    *   (Refer to the previous detailed deployment guide for more Task Scheduler settings).

6.  **Test Deployment:**
    *   Manually run the Task Scheduler task or restart the machine.
    *   Access the application from another computer on the local network using `http://<SERVER_IP_ADDRESS>:8000`.
    *   Check `C:\apps\pg_document_hub\logs\server_output.log` for any errors.
    *   Check Django logs (if configured in `settings.py`) in `C:\apps\pg_document_hub\medmat_project\logs\django_app.log`.

---

## Accessing Django Admin

Once the application is running (either in development or deployed):

*   Navigate to `http://<SERVER_IP_ADDRESS>:<PORT>/admin/` (e.g., `http://127.0.0.1:8000/admin/` in development).
*   Log in with the superuser credentials created during setup.
*   From the admin panel, you can manage Users (create PG Scholars, Professors, assign roles, set passwords), Batches, Discussion Types, and view/manage Schedules and Uploaded Files.

---

## Troubleshooting Common Issues

*   **Static Files Not Loading (CSS/JS errors, MIME type errors):**
    *   Ensure `DEBUG = False` in `settings.py` for production.
    *   Verify `base: '/static/'` is set in `medmat-frontend/vite.config.ts` and you've rebuilt the frontend (`npm run build`).
    *   Confirm `python manage.py collectstatic --noinput` was run successfully and files are in your `STATIC_ROOT`.
    *   Check `WhiteNoiseMiddleware` is correctly placed in `MIDDLEWARE` in `settings.py`.
    *   Ensure `ALLOWED_HOSTS` includes the IP/hostname you are using to access the app.
*   **"Page Not Found" (404 errors) for API calls or media files:**
    *   Check Django URL configurations (`urls.py` in project and app).
    *   Ensure `MEDIA_URL` and `MEDIA_ROOT` are correctly set up, and for development, that the `if settings.DEBUG:` block for serving media files is in your main `urls.py`. In production with Waitress/WhiteNoise, direct media serving needs careful setup; a dedicated download view (as implemented) is more robust for ensuring downloads.
*   **Server Not Starting via Task Scheduler:**
    *   Check the `Last Run Result` in Task Scheduler for error codes.
    *   Thoroughly examine the log file specified in `run_server.bat` (`server_output.log`).
    *   Ensure the user account running the task has permissions to the project directory and to bind to the specified port.
    *   Try running `run_server.bat` manually from an administrator command prompt to see direct console output.
*   **Permission Denied (403 Errors) on API Endpoints:**
    *   Review permission classes in `core_api/views.py` and `core_api/permissions.py`.
    *   Ensure users have the correct roles and `is_staff` status (managed via Django Admin).

---

## Developer Notes

*   **Main Developer:** Dr. Aghosh B Prasad
*   **Purpose:** To simplify and automate the management of PG academic documents for the Department of Materia Medica, WMHMC.
*   **Source Code:** `https://github.com/reun100e/PG-Document-Hub`

---

## Contributing

This project is primarily for internal department use. If you wish to contribute or suggest improvements, please contact Dr. Aghosh B Prasad.

---

## License

This project is currently for internal use by the Department of Materia Medica, WMHMC. Please consult with the developer regarding licensing if external use or distribution is considered.
