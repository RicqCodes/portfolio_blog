import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entity/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find();
  }

  async createTag(name: string): Promise<Tag> {
    const trimmedName = name.trim();
    let existingTag = await this.tagRepository.findOne({
      where: { name: trimmedName },
    });
    if (existingTag) return existingTag;

    const tag = new Tag();
    tag.name = trimmedName;
    return this.tagRepository.save(tag);
  }

  async deleteTag(
    name: string,
  ): Promise<{ status: string; message: string }> {
    const existingTag = await this.tagRepository.findOne({
      where: { name },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag ${name} not found`);
    }

    await this.tagRepository.remove(existingTag);
    return {
      status: 'success',
      message: `Tag ${name} has been deleted.`,
    };
  }
}
