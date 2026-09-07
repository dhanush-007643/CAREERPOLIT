import apiClient from './client';
import { ApiResponse, FresherProfile } from '../types';

export const profileApi = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<FresherProfile>>('/freshers/profile');
    return res.data;
  },

  updateProfile: async (data: Partial<FresherProfile>) => {
    const res = await apiClient.put<ApiResponse<FresherProfile>>('/freshers/profile', data);
    return res.data;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await apiClient.post<ApiResponse<{ resume: any; profile: FresherProfile }>>(
      '/freshers/resume',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  deleteResume: async () => {
    const res = await apiClient.delete<ApiResponse<{ profile: FresherProfile }>>('/freshers/resume');
    return res.data;
  },
};
