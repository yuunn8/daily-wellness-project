import { apiFetch } from './client';

export const getPosts = async () => {
  return apiFetch('/posts');
};

export const createPost = async (payload: { content: string }) => {
  return apiFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};


export const updatePost = async (postId: number, content: string) => {
  return apiFetch(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  });
};

export const deletePost = async (postId: number) => {
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