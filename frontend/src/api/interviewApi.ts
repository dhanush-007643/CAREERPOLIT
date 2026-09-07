import { apiClient } from './client';
import { ApiResponse, Interview } from '../types';

export const interviewApi = {
  getAll: async (page = 1, limit = 20): Promise<ApiResponse<Interview[]>> => {
    const res = await apiClient.get<ApiResponse<Interview[]>>('/interviews', {
      params: { page, limit },
    });
    return res.data;
  },

  schedule: async (payload: {
    applicationId: string;
    date: string;
    time: string;
    durationMinutes?: number;
    meetingLink: string;
    interviewType?: string;
    notes?: string;
  }): Promise<ApiResponse<Interview>> => {
    const res = await apiClient.post<ApiResponse<Interview>>('/interviews', payload);
    return res.data;
  },

  updateStatus: async (
    id: string,
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED',
    feedback?: string
  ): Promise<ApiResponse<Interview>> => {
    const res = await apiClient.patch<ApiResponse<Interview>>(`/interviews/${id}/status`, {
      status,
      feedback,
    });
    return res.data;
  },
};
