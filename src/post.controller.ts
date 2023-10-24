import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreateBlogPostDto } from './dto/post.dto';
import { BlogPost } from './entity/post.entity';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async createBlogPost(@Body() createBlogPostDto: CreateBlogPostDto) {
    const newBlogPost =
      await this.postService.createBlogPost(createBlogPostDto);
    // Map the blogPost entity to BlogPostDto
    const blogPostDto: CreateBlogPostDto = {
      title: newBlogPost.title,
      cover_image: newBlogPost.cover_image,
      contentBlocks: newBlogPost.contentBlocks.map((block) => ({
        type: block.type,
        content: block.content,
        imageUrl: block.imageUrl,
        title: block.title,
        codeType: block.codeType,
        list: block.list,
        links: block.links,
      })),
      tags: newBlogPost.tags.map((tag) => ({ name: tag.name })),
    };
    return blogPostDto;
  }

  @Get()
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const blogPosts = await this.postService.getAllBlogPosts();

    return blogPosts;
  }

  @Get(':slug')
  async getBlogPost(@Param('slug') slug: string): Promise<BlogPost> {
    // Call the getBlogPostById method from the service
    return this.postService.getBlogPostById(slug);
  }

  @Put(':id')
  async updateBlogPost(
    @Param('id') id: number,
    @Body() updateData: Partial<BlogPost>,
  ): Promise<BlogPost> {
    return await this.postService.updateBlogPost(id, updateData);
  }

  @Get('byTag/:tagName')
  async getBlogPostsByTag(
    @Param('tagName') tagName: string,
  ): Promise<BlogPost[]> {
    return this.postService.getBlogPostsByTag(tagName);
  }

  @Delete(':id')
  async deleteBlogPost(
    @Param('id') id: number,
  ): Promise<{ status: string; message: string }> {
    return await this.postService.deleteBlogPost(id);
  }
}
