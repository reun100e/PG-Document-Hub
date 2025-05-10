// src/utils/userDisplay.ts
import type { User, SimpleUser } from '../types'; // Assuming SimpleUser is also used for dropdowns

export const getUserDisplayName = (user: User | SimpleUser | null | undefined): string => {
    if (!user) {
        return 'N/A';
    }

    // If it's a superuser and they don't have a specific application role,
    // they might not be intended for display in most frontend contexts.
    // The backend filtering should prevent this, but as a safeguard:
    if (user.is_superuser && !user.role) { // A pure superuser, not also a professor etc.
        // return "System Administrator"; // Or simply fallback to username if needed
        return user.username; // Or an empty string if they should truly be invisible
    }

    // Construct full name, prioritizing first_name and last_name
    let fullName = '';
    if (user.first_name && user.last_name) {
        fullName = `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
        fullName = user.first_name;
    } else if (user.last_name) {
        fullName = user.last_name;
    } else {
        fullName = user.username; // Fallback to username if names are not set
    }

    if ('role' in user && user.role === 'professor') {
        return `Prof. Dr. ${fullName}`; // Or "Professor ${fullName}"
    }

    // For 'student' and 'batch_leader', treat as "PG Scholar" with "Dr." prefix
    if ('role' in user && (user.role === 'student' || user.role === 'batch_leader')) {
        return `Dr. ${fullName}`;
    }

    // Fallback for other roles or if role is not defined (e.g., admin who is just a superuser)
    // Or if username is the display name for admin.
    if ('is_staff' in user && user.is_staff && !('role' in user && user.role)) { // Example for a superuser admin without a specific 'role'
        return `Admin: ${fullName}`;
    }

    return fullName; // Default fallback
};

export const getRoleDisplay = (user: User | SimpleUser | null | undefined): string => {
    if (!user) return '';
    if ('role' in user && user.role === 'professor') return 'Professor';
    if ('role' in user && (user.role === 'student' || user.role === 'batch_leader')) return 'PG Scholar';
    if ('is_staff' in user && user.is_staff && !('role' in user && user.role)) return 'Administrator'; // For superuser without a specific role
    return ('role' in user && user.role) ? user.role.replace('_', ' ') : 'User'; // Generic fallback
}