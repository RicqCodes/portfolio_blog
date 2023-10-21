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

    return newBlogPost;
  }

  @Get()
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const blogPosts = await this.postService.getAllBlogPosts();

    return blogPosts;
  }

  @Get(':id')
  async getBlogPost(@Param('id') id: number): Promise<BlogPost> {
    // Call the getBlogPostById method from the service
    return this.postService.getBlogPostById(id);
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
