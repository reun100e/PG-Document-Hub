// src/services/appDataService.ts
import apiClient from './api';
import type { Batch, DiscussionType, Schedule, SimpleUser } from '../types';
import { create } from 'zustand';

interface AppDataState {
    batches: Batch[];
    discussionTypes: DiscussionType[];
    schedules: Schedule[];
    // users: UserType[]; // This was for UserViewSet, less used now for presenter forms
    presenterCandidates: SimpleUser[]; // Specifically for presenter selection by staff
    isLoading: {
        batches: boolean;
        discussionTypes: boolean;
        schedules: boolean;
        // users: boolean;
        presenterCandidates: boolean;
    };
    error: string | null;
    fetchBatches: () => Promise<void>;
    fetchDiscussionTypes: () => Promise<void>;
    fetchSchedules: (params?: { batchId?: number, presenterId?: number }) => Promise<void>;
    // fetchUsers: (params?: { role?: string, batchId?: number }) => Promise<void>; // Deprecate if UserViewSet list is admin only
    fetchPresenterCandidates: (params?: { batchId?: number }) => Promise<void>; // For staff forms
}

export const useAppDataStore = create<AppDataState>((set, get) => ({
    batches: [],
    discussionTypes: [],
    schedules: [],
    // users: [],
    presenterCandidates: [],
    isLoading: {
        batches: false,
        discussionTypes: false,
        schedules: false,
        // users: false,
        presenterCandidates: false,
    },
    error: null,

    fetchBatches: async () => { /* ... (no change) ... */
        set(state => ({ isLoading: { ...state.isLoading, batches: true }, error: null }));
        try {
            const response = await apiClient.get<Batch[]>('/batches/');
            set(state => ({ batches: response.data, isLoading: { ...state.isLoading, batches: false } }));
        } catch (err) {
            console.error("Failed to fetch batches:", err);
            set(state => ({ isLoading: { ...state.isLoading, batches: false }, error: 'Failed to load batches.' }));
        }
    },
    fetchDiscussionTypes: async () => { /* ... (no change) ... */
        set(state => ({ isLoading: { ...state.isLoading, discussionTypes: true }, error: null }));
        try {
            const response = await apiClient.get<DiscussionType[]>('/discussion-types/');
            set(state => ({ discussionTypes: response.data, isLoading: { ...state.isLoading, discussionTypes: false } }));
        } catch (err) {
            console.error("Failed to fetch discussion types:", err);
            set(state => ({ isLoading: { ...state.isLoading, discussionTypes: false }, error: 'Failed to load discussion types.' }));
        }
    },
    fetchSchedules: async (params = {}) => { /* ... (no change, backend filters by role) ... */
        set(state => ({ isLoading: { ...state.isLoading, schedules: true }, error: null }));
        try {
            const queryParams = new URLSearchParams();
            if (params.batchId) queryParams.append('batch_id', String(params.batchId));
            if (params.presenterId) queryParams.append('presenterId', String(params.presenterId));

            const response = await apiClient.get<Schedule[]>(`/schedules/?${queryParams.toString()}`);
            set(state => ({ schedules: response.data, isLoading: { ...state.isLoading, schedules: false } }));
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
            set(state => ({ isLoading: { ...state.isLoading, schedules: false }, error: 'Failed to load schedules.' }));
        }
    },

    fetchPresenterCandidates: async (params = {}) => {
        // This function should only be invoked by staff users on the frontend.
        set(state => ({ isLoading: { ...state.isLoading, presenterCandidates: true }, error: null }));
        try {
            const queryParams = new URLSearchParams();
            if (params.batchId) queryParams.append('batchId', String(params.batchId));
            // Role is implicitly 'student' in the backend endpoint
            const response = await apiClient.get<SimpleUser[]>(`/presenter-candidates/?${queryParams.toString()}`);
            set(state => ({
                presenterCandidates: response.data,
                isLoading: { ...state.isLoading, presenterCandidates: false }
            }));
        } catch (err: unknown) {
            console.error("Failed to fetch presenter candidates:", err);
            // Only set a general error if it's a significant failure; individual components might handle display.
            // Don't overwrite a schedules load error with a presenter load error if schedules are more critical.
            if (!get().schedules.length || !get().error?.includes("schedules")) { // Avoid overwriting more critical errors
                const errorResponse = (err as { response?: { status?: number } })?.response;
                set(state => ({ isLoading: { ...state.isLoading, presenterCandidates: false }, error: errorResponse?.status === 403 ? null : 'Failed to load presenter options.' }));
            } else {
                set(state => ({ isLoading: { ...state.isLoading, presenterCandidates: false } })); // Still set loading to false
            }
        }
    }
}));