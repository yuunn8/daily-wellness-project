import { apiFetch } from './client';

export const signup = async (payload: {
  email: string;
  password: string;
  nickname: string;
}) => {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const login = async (payload: {
  email: string;
  password: string;
}) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const logout = async () => {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
};