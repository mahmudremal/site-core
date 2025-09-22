import apiClient from './api';

export const login = async (credentials) => {
  // This is a placeholder. You need to implement the actual JWT authentication logic.
  const response = await apiClient.post('/jwt-auth/v1/token', credentials);
  return response.data;
};
