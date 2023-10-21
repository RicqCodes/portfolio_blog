// tag.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './entity/tag.entity';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAllTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }
}
