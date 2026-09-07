import { apiClient } from './client';
import { ApiResponse, CareerRoadmap, SkillGapAnalysis } from '../types';

export const careerApi = {
  getProfile: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/career/profile');
    return res.data;
  },

  getSkillGap: async (targetRole?: string): Promise<ApiResponse<SkillGapAnalysis>> => {
    const res = await apiClient.get<ApiResponse<SkillGapAnalysis>>('/career/skill-gap', {
      params: targetRole ? { targetRole } : {},
    });
    return res.data;
  },

  getRoadmap: async (targetRole?: string): Promise<ApiResponse<CareerRoadmap>> => {
    const res = await apiClient.get<ApiResponse<CareerRoadmap>>('/career/roadmap', {
      params: targetRole ? { targetRole } : {},
    });
    return res.data;
  },

  setGoal: async (targetRole: string): Promise<ApiResponse<CareerRoadmap>> => {
    const res = await apiClient.post<ApiResponse<CareerRoadmap>>('/career/goal', { targetRole });
    return res.data;
  },

  updateStepProgress: async (stepNumber: number, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): Promise<ApiResponse<CareerRoadmap>> => {
    const res = await apiClient.patch<ApiResponse<CareerRoadmap>>('/career/roadmap/step', { stepNumber, status });
    return res.data;
  },
};
