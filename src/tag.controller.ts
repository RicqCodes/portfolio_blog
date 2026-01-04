// tag.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './entity/tag.entity';
import { TagDto } from './dto/tag.dto';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTag(@Body() tagDto: TagDto): Promise<Tag> {
    return this.tagService.createTag(tagDto.name);
  }

  @Delete(':name')
  @UseGuards(JwtAuthGuard)
  async deleteTag(
    @Param('name') name: string,
  ): Promise<{ status: string; message: string }> {
    return this.tagService.deleteTag(name);
  }
}
