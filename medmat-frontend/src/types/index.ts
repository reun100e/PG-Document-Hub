export type UserRole = 'student' | 'batch_leader' | 'professor'; // Admin is via is_staff

export interface Batch {
    id: number;
    name: string;
    start_year: number;
    end_year: number;
    is_active: boolean;
}

// For detailed user object (e.g., loggedInUser from useAuth)
export interface User {
    id: number;
    username: string; // Doctor's name (primary identifier)
    email?: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    batch: number | null; // Batch ID
    batch_name?: string | null;
    is_staff: boolean; // Crucial for frontend UI logic for staff actions
    is_superuser?: boolean; // Add this

}

// For lists of users in dropdowns (e.g., presenters, login options)
export interface SimpleUser {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    role: UserRole;
    batch_id: number | null; // So frontend can filter presenter candidates by batch if needed
    is_staff: boolean;
    is_superuser?: boolean; // Add this

}

export interface DiscussionType {
    id: number;
    name: string;
    slug: string;
}

export interface Schedule {
    id: number;
    batch: number; // Batch ID
    batch_name: string;
    discussion_type: number; // DiscussionType ID
    discussion_type_name: string;
    title: string;
    presenter: number | null; // User ID of the presenter
    presenter_username: string | null; // Username of the presenter (fallback)
    // presenter_details?: SimpleUser | null; // If embedding SimpleUser in ScheduleSerializer
    scheduled_date: string; // "YYYY-MM-DD"
    created_by: number | null;
    created_by_username: string | null;
    description?: string;
    is_submission_uploaded: boolean;
}

export interface UploadedFile {
    id: number;
    uploader: number; // User ID
    uploader_username: string; // Username of uploader
    // uploader_details?: SimpleUser | null; // If embedding
    batch: number;
    batch_name: string;
    discussion_type: number;
    discussion_type_name: string;
    schedule: number | null;
    schedule_title: string | null;
    file: string; // URL on upload, or File object (transient)
    file_url: string; // Persistent URL to access the file
    original_filename: string;
    upload_date: string; // DateTime string
    description?: string;
}

export interface AuthResponse {
    token: string;
    user: User; // Full User object on login
}