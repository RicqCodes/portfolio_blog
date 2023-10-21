import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBlogPostDto } from './dto/post.dto';
import { BlogPost } from './entity/post.entity';
import { ContentBlock } from './entity/block.entity';
import { Tag } from './entity/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepository: Repository<BlogPost>,
  ) {}
  async createBlogPost(
    createBlogPostDto: CreateBlogPostDto,
  ): Promise<BlogPost> {
    const { title, cover_image, contentBlocks, tags } = createBlogPostDto;

    // Create a new BlogPost entity and set its properties
    const blogPost = new BlogPost();
    blogPost.title = title;
    blogPost.cover_image = cover_image;

    // Create and associate ContentBlocks with the blog post
    const contentBlockEntities = contentBlocks.map((blockDto) => {
      const contentBlock = new ContentBlock();
      contentBlock.type = blockDto.type;
      contentBlock.content = blockDto.content;
      contentBlock.imageUrl = blockDto.imageUrl; // If 'type' is 'image'
      contentBlock.blogPost = blogPost; // Associate with the blog post
      return contentBlock;
    });

    // Create and associate Tags with the blog post
    const tagEntities = tags.map((tagDto) => {
      const tag = new Tag();
      tag.name = tagDto.name;
      // You can create and associate other properties of Tag here if needed
      return tag;
    });

    // Set the associations
    blogPost.contentBlocks = contentBlockEntities;
    blogPost.tags = tagEntities;

    // Save the new blog post to the database
    return this.blogPostRepository.save(blogPost);
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.blogPostRepository.find();
  }

  async getBlogPostById(id: number): Promise<BlogPost> {
    const blogPost = await this.blogPostRepository.findOne({ where: { id } });

    if (!blogPost)
      throw new NotFoundException(`Blog post with ID ${id} not found`);

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
