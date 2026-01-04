import { Column, Entity, ManyToOne } from 'typeorm';
import { BlogPost } from './post.entity';
import { AbstractEntity } from './abstract.entity';
import { ContentBlockType } from '../types/content-block.types';

@Entity('content_blocks')
export class ContentBlock extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ['text', 'heading', 'divider', 'image', 'video', 'code', 'list'],
  })
  type: ContentBlockType;

  @Column()
  order: number;

  @Column('jsonb', { nullable: true })
  title: { type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'; text: string };

  @Column('text', { nullable: true })
  content: string;

  @Column('jsonb', { nullable: true })
  list: { type: 'ordered' | 'unordered'; content: string[] };

  @Column('jsonb', { nullable: true })
  links: { text: string; url: string }[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  codeType: string;

  @ManyToOne(() => BlogPost, (blogPost) => blogPost.contentBlocks, {
    onDelete: 'CASCADE',
  })
  blogPost: BlogPost;
}
