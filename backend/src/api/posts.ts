import { apiFetch } from './client';

export const getPosts = async () => {
  return apiFetch('/posts');
};

export const createPost = async (payload: { content: string; image?: File | null }) => {
  if (payload.image) {
    const formData = new FormData();
    formData.append('content', payload.content);
    formData.append('image', payload.image);

    return apiFetch('/posts', {
      method: 'POST',
      body: formData,
    });
  }

  return apiFetch('/posts', {
    method: 'POST',
    body: JSON.stringify({ content: payload.content }),
  });
};

export const updatePost = async (
  postId: string | number,
  payload: { content: string; image?: File | null }
) => {
  const formData = new FormData();
  formData.append('content', payload.content);

  if (payload.image) {
    formData.append('image', payload.image);
  }

  return apiFetch(`/posts/${postId}`, {
    method: 'PATCH',
    body: formData,
  });
};

export const deletePost = async (postId: string | number) => {
  return apiFetch(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const toggleLike = async (postId: number) => {
  return apiFetch(`/posts/${postId}/like`, {
    method: 'POST',
  });
};

export const createComment = async (postId: number, content: string) => {
  return apiFetch(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

export const deleteComment = async (postId: string | number, commentId: string | number) => {
  return apiFetch(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
};
