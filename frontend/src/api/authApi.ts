import apiClient from './client';
import { ApiResponse, User } from '../types';

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User; profile: any }>>('/auth/login', credentials);
    return res.data;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    companyName?: string;
    industry?: string;
    location?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<{ token: string; user: User; profile: any }>>('/auth/register', payload);
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get<ApiResponse<{ user: User; profile: any }>>('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post<ApiResponse<{}>>('/auth/logout');
    return res.data;
  },
};
