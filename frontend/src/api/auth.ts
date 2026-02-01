import apiClient from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/login', {
      username,
      password,
    });
    return response.data;
  },
};
