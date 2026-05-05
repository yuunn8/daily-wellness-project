const API_BASE_URL = 'https://daily-wellness.onrender.com/api';

export const verifyMission = async (payload: {
  missionId: number;
  image: File;
  content?: string;
}) => {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('missionId', String(payload.missionId));
  formData.append('image', payload.image);

  if (payload.content) {
    formData.append('content', payload.content);
  }

  const res = await fetch(`${API_BASE_URL}/missions/verify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || '미션 인증 실패');
  }

  return data;
};