const API_BASE_URL = 'http://localhost:5000/api';

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
};