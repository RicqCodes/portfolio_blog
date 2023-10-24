import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPost } from './post.entity';

type ContentBlockType =
  | 'text'
  | 'heading'
  | 'divider'
  | 'image'
  | 'video'
  | 'code'
  | 'list';

@Entity('content_blocks')
export class ContentBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['text', 'heading', 'divider', 'image', 'video', 'code', 'list'],
  })
  type: ContentBlockType;

  @Column('text', { nullable: true })
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

  @ManyToOne(() => BlogPost, (BlogPost) => BlogPost.contentBlocks)
  blogPost: BlogPost;
}
