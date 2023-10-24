import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogPostDto } from './dto/post.dto';
import { BlogPost } from './entity/post.entity';
import { ContentBlock } from './entity/block.entity';
import { Tag } from './entity/tag.entity';
import { Repository } from 'typeorm';
import { Helper } from './helperClass';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>, // Make sure to include this line
    @InjectRepository(ContentBlock)
    private contentBlockRepository: Repository<ContentBlock>, // Make sure to include this line
  ) {}
  async createBlogPost(
    createBlogPostDto: CreateBlogPostDto,
  ): Promise<BlogPost> {
    const { title, cover_image, contentBlocks, tags } = createBlogPostDto;

    // Create a new BlogPost entity and set its properties
    const blogPost = new BlogPost();
    blogPost.title = title;
    blogPost.cover_image = cover_image;
    blogPost.readTime = Helper.calculateReadingTime(contentBlocks);

    // Create and associate ContentBlocks with the blog post
    const contentBlockEntities = contentBlocks.map((blockDto) => {
      const contentBlock = new ContentBlock();
      contentBlock.type = blockDto.type;

      switch (blockDto.type) {
        case 'text':
          if (
            blockDto.content !== undefined &&
            blockDto.content.trim() !== ''
          ) {
            contentBlock.content = blockDto.content;

            if (blockDto.links) {
              contentBlock.links = blockDto.links;
            }
          }
          break;
        case 'heading':
          // Handle heading type
          contentBlock.title = blockDto.title;
          // Set contentBlock.title and other properties accordingly
          break;
        case 'divider':
          // Handle divider type
          contentBlock.content = blockDto.content;
          break;
        case 'image':
          // Handle image type
          contentBlock.imageUrl = blockDto.imageUrl;
          contentBlock.content = blockDto.content;
          break;
        case 'video':
          // Handle video type
          break;
        case 'code':
          // Handle code type
          contentBlock.codeType = blockDto.codeType;
          contentBlock.content = blockDto.content;
          break;
        case 'list':
          // Handle list type
          contentBlock.list = blockDto.list;

          if (blockDto.links) {
            contentBlock.links = blockDto.links;
          }
          break;
        default:
          // Handle unknown type or raise an error
          break;
      }
      contentBlock.blogPost = blogPost;
      return contentBlock;
    });

    // Save the ContentBlock entities
    await this.contentBlockRepository.insert(contentBlockEntities);

    // Initialize an array to hold the associated tags
    const tagEntities: Tag[] = [];

    // Iterate over the provided tags
    for (const tagDto of tags) {
      // Check if the tag with the same name already exists in the database
      let existingTag = await this.tagRepository.findOne({
        where: { name: tagDto.name },
        relations: ['blogPosts'], // Load the blogPosts relation
      });

      if (!existingTag) {
        existingTag = new Tag();
        existingTag.name = tagDto.name;
        existingTag.blogPosts = []; // Initialize blogPosts as an empty array
        console.log('existing tag', existingTag);
      }

      // Push the new blogPost into the tag's relation
      existingTag.blogPosts = [...existingTag.blogPosts, blogPost];

      // Save the Tag entity if it's a new one
      if (!existingTag.id) {
        await this.tagRepository.save(existingTag);
      }

      tagEntities.push(existingTag);
    }

    // Set the associations
    blogPost.contentBlocks = contentBlockEntities;
    blogPost.tags = tagEntities;

    // Save the new blog post to the database
    return this.blogPostRepository.save(blogPost);
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.blogPostRepository.find({
      relations: { tags: true },
    });
  }

  async getBlogPostById(slug: string): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({
      where: { slug },
      relations: { tags: true, contentBlocks: true },
      order: {
        id: 'asc',
      },
    });

    if (!blogPost) throw new NotFoundException(`Blog post, ${slug} not found`);

    // if (blogPost) {
    // Sort the contentBlocks array by id in ascending order
    blogPost.contentBlocks = blogPost.contentBlocks.sort((a, b) => a.id - b.id);
    // }

    // Increment the 'view' count
    blogPost.views += 1;

    // Save the updated blog post with the incremented 'view' count
    await this.blogPostRepository.save(blogPost);

    return blogPost;
  }

  async updateBlogPost(
    id: number,
    updateData: Partial<BlogPost>,
  ): Promise<BlogPost> {
    const exisitingBlogPost = await this.blogPostRepository.findOne({
      where: { id },
    });

    if (!exisitingBlogPost)
      throw new NotFoundException(`Blog post with ID ${id} not found`);

    const updatedBlogPost = Object.assign(exisitingBlogPost, updateData);

    return this.blogPostRepository.save(updatedBlogPost);
  }

  async getBlogPostsByTag(tagName: string): Promise<BlogPost[]> {
    return this.blogPostRepository
      .createQueryBuilder('blogPost')
      .innerJoin('blogPost.tags', 'tag')
      .innerJoinAndSelect('blogPost.contentBlocks', 'contentBlock')
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
