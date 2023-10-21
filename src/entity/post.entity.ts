import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentBlock } from './block.entity';
import { Tag } from './tag.entity';
import { AbstractEntity } from './abstract.entity';

@Entity('blog_posts')
export class BlogPost extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  cover_image: string;

  @Column()
  views: number;

  @OneToMany(() => ContentBlock, (block) => block.blogPost, { eager: true })
  contentBlocks: ContentBlock[];

  @ManyToMany(() => Tag, (tag) => tag.blogPosts)
  tags: Tag[];
}
