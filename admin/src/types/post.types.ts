import type { ContentBlockDto } from './block.types';
import type { TagDto, TagResponseDto } from './tag.types';

export interface CreateBlogPostDto {
  title: string;
  coverImage: string;
  contentBlocks: ContentBlockDto[];
  tags: TagDto[];
}

export interface UpdateBlogPostDto {
  title?: string;
  coverImage?: string;
  contentBlocks?: ContentBlockDto[];
  tags?: TagDto[];
}

export interface BlogPostSummaryDto {
  id: number;
  title: string;
  slug: string;
  coverImage: string;
  readTime: number;
  views: number;
  tags: TagResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostResponseDto extends BlogPostSummaryDto {
  contentBlocks: ContentBlockDto[];
}

export interface PaginatedBlogPostSummaryDto {
  items: BlogPostSummaryDto[];
  total: number;
  page: number;
  limit: number;
}
