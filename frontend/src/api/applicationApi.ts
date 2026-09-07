import apiClient from './client';
import { ApiResponse, Application, ApplicationStatus } from '../types';

export const applicationApi = {
  getMyApplications: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get<ApiResponse<Application[]>>('/applications/my', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Application>>(`/applications/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: ApplicationStatus, note?: string) => {
    const res = await apiClient.patch<ApiResponse<Application>>(`/applications/${id}/status`, {
      status,
      note,
    });
    return res.data;
  },
};

export const atsApi = {
  getPipeline: async (jobId?: string) => {
    const res = await apiClient.get<ApiResponse<{
      companyId: string;
      companyName: string;
      totalApplicants: number;
      pipeline: Record<ApplicationStatus, Application[]>;
    }>>('/company/pipeline', {
      params: jobId ? { jobId } : {},
    });
    return res.data;
  },

  updateStage: async (applicationId: string, status: ApplicationStatus, note?: string) => {
    const res = await apiClient.patch<ApiResponse<Application>>(`/company/applications/${applicationId}/status`, {
      status,
      note,
    });
    return res.data;
  },
};
