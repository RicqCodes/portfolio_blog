import apiClient from './client';
import type { TagResponseDto } from '@/types/tag.types';

export const getTags = async (): Promise<TagResponseDto[]> => {
  const { data } = await apiClient.get('/tags');
  return data;
};

export const createTag = async (name: string): Promise<TagResponseDto> => {
  const { data } = await apiClient.post('/tags', { name });
  return data;
};

export const deleteTag = async (name: string): Promise<void> => {
  await apiClient.delete(`/tags/${encodeURIComponent(name)}`);
};
