import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Put,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreateBlogPostDto } from './dto/post.dto';
import {
  BlogPostResponseDto,
  PaginatedBlogPostSummaryDto,
} from './dto/post-response.dto';
import { UpdateBlogPostDto } from './dto/post-update.dto';
import { mapBlogPostToResponse, mapBlogPostToSummary } from './post.mapper';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlogPost(
    @Body() createBlogPostDto: CreateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    const newBlogPost =
      await this.postService.createBlogPost(createBlogPostDto);
    return mapBlogPostToResponse(newBlogPost);
  }

  @Get()
  async getAllBlogPosts(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedBlogPostSummaryDto> {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const { items, total } = await this.postService.getAllBlogPosts(
      safePage,
      safeLimit,
    );

    return {
      items: items.map(mapBlogPostToSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  @Get('byTag/:tagName')
  async getBlogPostsByTag(
    @Param('tagName') tagName: string,
  ): Promise<BlogPostResponseDto[]> {
    const blogPosts = await this.postService.getBlogPostsByTag(tagName);
    return blogPosts.map(mapBlogPostToResponse);
  }

  @Get(':slug')
  async getBlogPost(
    @Param('slug') slug: string,
    @Query('incrementViews') incrementViews?: string,
  ): Promise<BlogPostResponseDto> {
    const shouldIncrement =
      incrementViews !== 'false' && incrementViews !== '0';
    const blogPost = await this.postService.getBlogPostById(
      slug,
      shouldIncrement,
    );
    return mapBlogPostToResponse(blogPost);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlogPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    const blogPost = await this.postService.updateBlogPost(id, updateData);
    return mapBlogPostToResponse(blogPost);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlogPost(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: string; message: string }> {
    return await this.postService.deleteBlogPost(id);
  }
}
