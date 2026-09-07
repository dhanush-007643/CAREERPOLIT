import { apiClient } from './client';
import { ApiResponse, AppNotification } from '../types';

export const notificationApi = {
  getAll: async (page = 1, limit = 20): Promise<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>> => {
    const res = await apiClient.get<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>>(
      '/notifications',
      { params: { page, limit } }
    );
    return res.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<AppNotification>> => {
    const res = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return res.data;
  },
};
