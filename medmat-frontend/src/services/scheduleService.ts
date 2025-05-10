import apiClient from './api';
import type { Schedule } from '../types';
// fetchSchedules is already in useAppDataStore, but we might want specific versions here.
// For simplicity, let's assume appDataStore.fetchSchedules is used for listing.

interface SchedulePayload { // For create and update
    batch: number;
    discussion_type: number;
    title: string;
    presenter?: number | null; // Optional presenter User ID
    scheduled_date: string; // "YYYY-MM-DD"
    description?: string;
}

export const createSchedule = async (payload: SchedulePayload): Promise<Schedule> => {
    // 'created_by' will be set on the backend from request.user
    const response = await apiClient.post<Schedule>('/schedules/', payload);
    return response.data;
};

export const updateSchedule = async (scheduleId: number, payload: Partial<SchedulePayload>): Promise<Schedule> => {
    const response = await apiClient.patch<Schedule>(`/schedules/${scheduleId}/`, payload);
    return response.data;
};

export const getScheduleDetails = async (scheduleId: number): Promise<Schedule> => {
    const response = await apiClient.get<Schedule>(`/schedules/${scheduleId}/`);
    return response.data;
};

export const deleteScheduleAPI = async (scheduleId: number): Promise<void> => {
    // Renamed to deleteScheduleAPI to avoid conflict if page has a handleDelete function
    await apiClient.delete(`/schedules/${scheduleId}/`);
};