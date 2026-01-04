import { BlogPost } from './entity/post.entity';
import { ContentBlock } from './entity/block.entity';
import { Tag } from './entity/tag.entity';
import {
  BlogPostResponseDto,
  BlogPostSummaryDto,
  ContentBlockResponseDto,
  TagResponseDto,
} from './dto/post-response.dto';

const mapTag = (tag: Tag): TagResponseDto => ({
  name: tag.name,
});

const mapContentBlock = (block: ContentBlock): ContentBlockResponseDto => ({
  type: block.type,
  order: block.order,
  title: block.title,
  content: block.content,
  list: block.list,
  links: block.links,
  imageUrl: block.imageUrl,
  codeType: block.codeType,
});

export const mapBlogPostToSummary = (post: BlogPost): BlogPostSummaryDto => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  coverImage: post.coverImage,
  readTime: post.readTime,
  views: post.views,
  tags: post.tags?.map(mapTag) ?? [],
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

export const mapBlogPostToResponse = (
  post: BlogPost,
): BlogPostResponseDto => ({
  ...mapBlogPostToSummary(post),
  contentBlocks: post.contentBlocks?.map(mapContentBlock) ?? [],
});
