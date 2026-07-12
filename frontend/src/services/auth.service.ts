import { api } from '@/lib/axios';
import type { AuthResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: any): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (credentials: any): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', credentials);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
