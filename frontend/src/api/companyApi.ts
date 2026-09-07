import { apiClient } from './client';
import { ApiResponse, Company } from '../types';

export const companyApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    location?: string;
  }): Promise<ApiResponse<Company[]>> => {
    const res = await apiClient.get<ApiResponse<Company[]>>('/companies', { params });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Company>> => {
    const res = await apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
    return res.data;
  },

  getMyProfile: async (): Promise<ApiResponse<Company>> => {
    const res = await apiClient.get<ApiResponse<Company>>('/companies/profile');
    return res.data;
  },

  updateMyProfile: async (payload: Partial<Company>): Promise<ApiResponse<Company>> => {
    const res = await apiClient.put<ApiResponse<Company>>('/companies/profile', payload);
    return res.data;
  },

  getFollowing: async (page = 1, limit = 50): Promise<ApiResponse<any[]>> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/companies/following', { params: { page, limit } });
    return res.data;
  },

  follow: async (companyId: string): Promise<ApiResponse<{ isFollowing: boolean }>> => {
    const res = await apiClient.post<ApiResponse<{ isFollowing: boolean }>>(`/companies/${companyId}/follow`);
    return res.data;
  },

  unfollow: async (companyId: string): Promise<ApiResponse<{ isFollowing: boolean }>> => {
    const res = await apiClient.delete<ApiResponse<{ isFollowing: boolean }>>(`/companies/${companyId}/follow`);
    return res.data;
  },
};
