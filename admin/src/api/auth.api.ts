import apiClient from './client';

interface LoginResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
}

export const loginApi = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const { data } = await apiClient.post('/auth/login', { username, password });
  return data;
};
