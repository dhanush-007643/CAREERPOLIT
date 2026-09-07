import { apiClient } from './client';
import { ApiResponse, MatchAnalysis } from '../types';

export const matchingApi = {
  getMatchedJobs: async (limit = 20) => {
    const res = await apiClient.get<ApiResponse<MatchAnalysis[]>>('/matching/jobs', {
      params: { limit },
    });
    return res.data;
  },

  getJobMatch: async (jobId: string) => {
    const res = await apiClient.get<ApiResponse<MatchAnalysis>>(`/matching/jobs/${jobId}`);
    return res.data;
  },

  getMatchedCandidates: async (jobId: string, limit = 50) => {
    const res = await apiClient.get<ApiResponse<MatchAnalysis[]>>(`/matching/candidates/${jobId}`, {
      params: { limit },
    });
    return res.data;
  },

  getRecommendedJobs: async (limit = 10) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/recommendations/jobs', {
      params: { limit },
    });
    return res.data;
  },

  getRecommendedCandidates: async (jobId: string, limit = 10) => {
    const res = await apiClient.get<ApiResponse<any[]>>(`/recommendations/candidates/${jobId}`, {
      params: { limit },
    });
    return res.data;
  },
};

export { careerApi } from './careerApi';
