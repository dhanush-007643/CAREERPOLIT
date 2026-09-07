import apiClient from './client';
import {
  ApiResponse,
  Assessment,
  AssessmentResult,
  Invitation,
  Interview,
  AppNotification,
} from '../types';

export const assessmentApi = {
  getAll: async (category?: string) => {
    const res = await apiClient.get<ApiResponse<Assessment[]>>('/assessments', {
      params: category ? { category } : {},
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Assessment>>(`/assessments/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Assessment>>('/assessments', data);
    return res.data;
  },

  submit: async (id: string, answers: Array<{ questionId: string; selectedOptionId: string }>) => {
    const res = await apiClient.post<ApiResponse<AssessmentResult>>(`/assessments/${id}/submit`, { answers });
    return res.data;
  },
};

export const invitationApi = {
  create: async (payload: { fresherId: string; jobId: string; message?: string; expiryDays?: number }) => {
    const res = await apiClient.post<ApiResponse<Invitation>>('/invitations', payload);
    return res.data;
  },

  getAll: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<Invitation[]>>('/invitations', {
      params: { page, limit },
    });
    return res.data;
  },

  accept: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Invitation>>(`/invitations/${id}/accept`);
    return res.data;
  },

  reject: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Invitation>>(`/invitations/${id}/reject`);
    return res.data;
  },
};

export const interviewApi = {
  schedule: async (data: {
    applicationId: string;
    date: string;
    time: string;
    durationMinutes?: number;
    meetingLink: string;
    interviewType?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Interview>>('/interviews', data);
    return res.data;
  },

  getAll: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<Interview[]>>('/interviews', {
      params: { page, limit },
    });
    return res.data;
  },

  update: async (id: string, data: Partial<Interview>) => {
    const res = await apiClient.put<ApiResponse<Interview>>(`/interviews/${id}`, data);
    return res.data;
  },

  cancel: async (id: string, reason?: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/interviews/${id}`, {
      data: { reason },
    });
    return res.data;
  },
};

export const notificationApi = {
  getAll: async (page = 1, limit = 20) => {
    const res = await apiClient.get<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>>(
      '/notifications',
      { params: { page, limit } }
    );
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return res.data;
  },
};

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
    return res.data;
  },

  getUsers: async (params: { page?: number; limit?: number; role?: string; search?: string } = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/users', { params });
    return res.data;
  },

  getCompanies: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/companies', { params });
    return res.data;
  },

  getJobs: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/jobs', { params });
    return res.data;
  },

  getApplications: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/admin/applications', { params });
    return res.data;
  },
};
