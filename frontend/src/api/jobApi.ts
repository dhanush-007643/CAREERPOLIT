import { apiClient } from './client';
import { ApiResponse, Job } from '../types';

export const jobApi = {
  search: async (params: {
    search?: string;
    skills?: string;
    location?: string;
    workMode?: string;
    experience?: string;
    employmentType?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const res = await apiClient.get<ApiResponse<Job[]>>('/jobs', { params });
    return res.data;
  },

  getMyJobs: async (params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const res = await apiClient.get<ApiResponse<Job[]>>('/jobs/my', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data;
  },

  create: async (data: Partial<Job>) => {
    const res = await apiClient.post<ApiResponse<Job>>('/jobs', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Job>) => {
    const res = await apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<any>>(`/jobs/${id}`);
    return res.data;
  },

  apply: async (jobId: string, payload: { resumeUrl?: string; coverLetter?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/jobs/${jobId}/apply`, payload);
    return res.data;
  },

  getJobApplications: async (jobId: string, params: { page?: number; limit?: number; status?: string } = {}) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/jobs/${jobId}/applications`, { params });
    return res.data;
  },
};
