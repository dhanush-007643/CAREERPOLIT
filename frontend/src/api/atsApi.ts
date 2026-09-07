import { apiClient } from './client';
import { ApiResponse, AtsPipelineData, Application, ApplicationStatus } from '../types';

export const atsApi = {
  getPipeline: async (jobId?: string): Promise<ApiResponse<AtsPipelineData>> => {
    const res = await apiClient.get<ApiResponse<AtsPipelineData>>('/company/pipeline', {
      params: { jobId },
    });
    return res.data;
  },

  updateStage: async (
    applicationId: string,
    status: ApplicationStatus,
    note?: string
  ): Promise<ApiResponse<Application>> => {
    const res = await apiClient.patch<ApiResponse<Application>>(
      `/company/applications/${applicationId}/status`,
      { status, note }
    );
    return res.data;
  },
};
