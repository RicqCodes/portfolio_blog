import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import slugify from 'slugify';
import { ContentBlock } from './block.entity';
import { Tag } from './tag.entity';
import { AbstractEntity } from './abstract.entity';

@Entity('blog_posts')
export class BlogPost extends AbstractEntity {
  @Column({ unique: true })
  title: string;

  @Index()
  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  readTime: number;

  @Column({ name: 'cover_image' })
  coverImage: string;

  @Column({ default: 0 })
  views: number;

  @OneToMany(() => ContentBlock, (block) => block.blogPost)
  contentBlocks: ContentBlock[];

  @ManyToMany(() => Tag, (tag) => tag.blogPosts)
  @JoinTable()
  tags: Tag[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true });
  }
}
