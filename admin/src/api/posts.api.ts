import apiClient from './client';
import type {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostResponseDto,
  PaginatedBlogPostSummaryDto,
} from '@/types/post.types';

export const getPosts = async (
  page: number,
  limit: number
): Promise<PaginatedBlogPostSummaryDto> => {
  const { data } = await apiClient.get(`/posts?page=${page}&limit=${limit}`);
  return data;
};

export const getPost = async (
  slug: string,
  incrementViews = false
): Promise<BlogPostResponseDto> => {
  const { data } = await apiClient.get(
    `/posts/${slug}?incrementViews=${incrementViews}`
  );
  return data;
};

export const createPost = async (
  post: CreateBlogPostDto
): Promise<BlogPostResponseDto> => {
  const { data } = await apiClient.post('/posts', post);
  return data;
};

export const updatePost = async (
  id: number,
  post: UpdateBlogPostDto
): Promise<BlogPostResponseDto> => {
  const { data} = await apiClient.put(`/posts/${id}`, post);
  return data;
};

export const deletePost = async (id: number): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};
