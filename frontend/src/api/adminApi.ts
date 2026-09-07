import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const adminApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard');
    return res.data;
  },

  getUsers: async (page = 1, limit = 20): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/admin/users', {
      params: { page, limit },
    });
    return res.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },
};
