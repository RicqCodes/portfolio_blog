import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPost } from './post.entity';

type ContentBlockType = 'text' | 'image' | 'video' | 'code' | 'list';

@Entity('content_blocks')
export class ContentBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['text', 'image', 'video', 'code'],
  })
  type: ContentBlockType;

  @Column('text', { nullable: true })
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => BlogPost, (BlogPost) => BlogPost.contentBlocks)
  blogPost: BlogPost;
}
