import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogPostDto } from './dto/post.dto';
import { UpdateBlogPostDto } from './dto/post-update.dto';
import { BlogPost } from './entity/post.entity';
import { ContentBlock } from './entity/block.entity';
import { Tag } from './entity/tag.entity';
import { In, Repository } from 'typeorm';
import { Helper } from './helperClass';
import { ContentBlockDto } from './dto/content.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(ContentBlock)
    private contentBlockRepository: Repository<ContentBlock>,
  ) {}

  private createContentBlock(
    blockDto: ContentBlockDto,
    order: number,
    blogPost: BlogPost,
  ): ContentBlock {
    const contentBlock = new ContentBlock();
    contentBlock.type = blockDto.type;
    contentBlock.order = order;

    switch (blockDto.type) {
      case 'text':
        contentBlock.content = blockDto.content;
        if (blockDto.links) {
          contentBlock.links = blockDto.links;
        }
        break;
      case 'heading':
        contentBlock.title = blockDto.title;
        break;
      case 'divider':
        contentBlock.content = blockDto.content;
        break;
      case 'image':
        contentBlock.imageUrl = blockDto.imageUrl;
        contentBlock.content = blockDto.content;
        break;
      case 'video':
        contentBlock.content = blockDto.content;
        break;
      case 'code':
        contentBlock.codeType = blockDto.codeType;
        contentBlock.content = blockDto.content;
        break;
      case 'list':
        contentBlock.list = blockDto.list;
        if (blockDto.links) {
          contentBlock.links = blockDto.links;
        }
        break;
      default:
        throw new BadRequestException(
          `Unknown content block type: ${blockDto.type}`,
        );
    }

    contentBlock.blogPost = blogPost;
    return contentBlock;
  }
  async createBlogPost(
    createBlogPostDto: CreateBlogPostDto,
  ): Promise<BlogPost> {
    const { title, coverImage, contentBlocks, tags } = createBlogPostDto;

    return this.blogPostRepository.manager.transaction(async (manager) => {
      const blogPostRepository = manager.getRepository(BlogPost);
      const tagRepository = manager.getRepository(Tag);
      const contentBlockRepository = manager.getRepository(ContentBlock);

      const blogPost = new BlogPost();
      blogPost.title = title;
      blogPost.coverImage = coverImage;
      blogPost.readTime = Helper.calculateReadingTime(contentBlocks);

      const savedBlogPost = await blogPostRepository.save(blogPost);

      const contentBlockEntities = contentBlocks.map((blockDto, index) =>
        this.createContentBlock(blockDto, index + 1, savedBlogPost),
      );

      await contentBlockRepository.save(contentBlockEntities);

      const tagEntities: Tag[] = [];

      const tagNames = tags.map((tagDto) => tagDto.name);
      const existingTags = await tagRepository.find({
        where: { name: In(tagNames) },
        relations: ['blogPosts'],
      });
      const existingTagsMap = new Map(
        existingTags.map((tag) => [tag.name, tag]),
      );

      for (const tagName of tagNames) {
        let tag = existingTagsMap.get(tagName);

        if (!tag) {
          tag = new Tag();
          tag.name = tagName;
          tag.blogPosts = [];
        }

        if (!tag.blogPosts.find((post) => post.id === savedBlogPost.id)) {
          tag.blogPosts = [...tag.blogPosts, savedBlogPost];
        }
        await tagRepository.save(tag);
        tagEntities.push(tag);
      }

      savedBlogPost.contentBlocks = contentBlockEntities;
      savedBlogPost.tags = tagEntities;

      return blogPostRepository.save(savedBlogPost);
    });
  }

  async getAllBlogPosts(
    page: number,
    limit: number,
  ): Promise<{ items: BlogPost[]; total: number }> {
    const [items, total] = await this.blogPostRepository.findAndCount({
      relations: { tags: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getBlogPostById(
    slug: string,
    incrementViews = true,
  ): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { slug },
      relations: { tags: true, contentBlocks: true },
      order: { contentBlocks: { order: 'ASC' } },
    });

    if (!blogPost) throw new NotFoundException(`Blog post, ${slug} not found`);

    if (incrementViews) {
      await this.blogPostRepository.increment({ id: blogPost.id }, 'views', 1);
      // Ensure response reflects the incremented view count.
      blogPost.views += 1;
    }

    return blogPost;
  }

  async updateBlogPost(
    id: number,
    updateData: UpdateBlogPostDto,
  ): Promise<BlogPost> {
    return this.blogPostRepository.manager.transaction(async (manager) => {
      const blogPostRepository = manager.getRepository(BlogPost);
      const tagRepository = manager.getRepository(Tag);
      const contentBlockRepository = manager.getRepository(ContentBlock);

      const existingBlogPost = await blogPostRepository.findOne({
        where: { id },
        relations: { tags: true, contentBlocks: true },
      });

      if (!existingBlogPost)
        throw new NotFoundException(`Blog post with ID ${id} not found`);

      if (updateData.title !== undefined) {
        existingBlogPost.title = updateData.title;
      }

      if (updateData.coverImage !== undefined) {
        existingBlogPost.coverImage = updateData.coverImage;
      }

      if (updateData.contentBlocks) {
        await contentBlockRepository
          .createQueryBuilder()
          .delete()
          .where('"blogPostId" = :postId', { postId: id })
          .execute();

        const contentBlockEntities = updateData.contentBlocks.map(
          (blockDto, index) =>
            this.createContentBlock(blockDto, index + 1, existingBlogPost),
        );

        await contentBlockRepository.save(contentBlockEntities);
        existingBlogPost.contentBlocks = contentBlockEntities;
        existingBlogPost.readTime = Helper.calculateReadingTime(
          updateData.contentBlocks,
        );
      }

      if (updateData.tags) {
        const tagNames = updateData.tags.map((tagDto) => tagDto.name);
        const existingTags = await tagRepository.find({
          where: { name: In(tagNames) },
          relations: ['blogPosts'],
        });
        const existingTagsMap = new Map(
          existingTags.map((tag) => [tag.name, tag]),
        );

        const tagEntities: Tag[] = [];
        for (const tagName of tagNames) {
          let tag = existingTagsMap.get(tagName);

          if (!tag) {
            tag = new Tag();
            tag.name = tagName;
            tag.blogPosts = [];
          }

          if (!tag.blogPosts.find((post) => post.id === existingBlogPost.id)) {
            tag.blogPosts = [...tag.blogPosts, existingBlogPost];
          }
          await tagRepository.save(tag);
          tagEntities.push(tag);
        }

        existingBlogPost.tags = tagEntities;
      }

      await blogPostRepository.save(existingBlogPost);

      const blogPostWithRelations = await blogPostRepository.findOne({
        where: { id: existingBlogPost.id },
        relations: { tags: true, contentBlocks: true },
        order: { contentBlocks: { order: 'ASC' } },
      });

      return blogPostWithRelations ?? existingBlogPost;
    });
  }

  async getBlogPostsByTag(tagName: string): Promise<BlogPost[]> {
    return this.blogPostRepository
      .createQueryBuilder('blogPost')
      .innerJoinAndSelect('blogPost.tags', 'tag')
      .innerJoinAndSelect('blogPost.contentBlocks', 'contentBlock')
      .orderBy('blogPost.id', 'ASC')
      .addOrderBy('contentBlock.order', 'ASC')
      .where('tag.name = :tagName', { tagName })
      .getMany();
  }

  async deleteBlogPost(
    id: number,
  ): Promise<{ status: string; message: string }> {
    const blogPostToDelete = await this.blogPostRepository.findOne({
      where: { id },
    });

    if (!blogPostToDelete)
      throw new NotFoundException(`Blog post with ID ${id} not found`);

    await this.blogPostRepository.remove(blogPostToDelete);

    return {
      status: 'success',
      message: `Blog post with ID ${id} has been successfully deleted.`,
    };
  }
}
