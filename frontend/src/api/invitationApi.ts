import { apiClient } from './client';
import { ApiResponse, Invitation } from '../types';

export const invitationApi = {
  getAll: async (): Promise<ApiResponse<Invitation[]>> => {
    const res = await apiClient.get<ApiResponse<Invitation[]>>('/invitations');
    return res.data;
  },

  create: async (payload: {
    fresherId: string;
    jobId: string;
    message?: string;
  }): Promise<ApiResponse<Invitation>> => {
    const res = await apiClient.post<ApiResponse<Invitation>>('/invitations', payload);
    return res.data;
  },

  accept: async (id: string): Promise<ApiResponse<Invitation>> => {
    const res = await apiClient.patch<ApiResponse<Invitation>>(`/invitations/${id}/accept`);
    return res.data;
  },

  reject: async (id: string): Promise<ApiResponse<Invitation>> => {
    const res = await apiClient.patch<ApiResponse<Invitation>>(`/invitations/${id}/reject`);
    return res.data;
  },
};
