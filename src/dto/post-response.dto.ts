import { ContentBlockType } from '../types/content-block.types';

export type HeadingTitle = {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  text: string;
};

export type ContentBlockList = {
  type: 'ordered' | 'unordered';
  content: string[];
};

export type ContentBlockLink = {
  text: string;
  url: string;
};

export class ContentBlockResponseDto {
  type: ContentBlockType;
  order?: number;
  title?: HeadingTitle;
  content?: string;
  list?: ContentBlockList;
  links?: ContentBlockLink[];
  imageUrl?: string;
  codeType?: string;
}

export class TagResponseDto {
  name: string;
}

export class BlogPostSummaryDto {
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

export class BlogPostResponseDto extends BlogPostSummaryDto {
  contentBlocks: ContentBlockResponseDto[];
}

export class PaginatedBlogPostSummaryDto {
  items: BlogPostSummaryDto[];
  total: number;
  page: number;
  limit: number;
}
