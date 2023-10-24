import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import slugify from 'slugify';
import { ContentBlock } from './block.entity';
import { Tag } from './tag.entity';
import { AbstractEntity } from './abstract.entity';

@Entity('blog_posts')
export class BlogPost extends AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  slug: string;

  @Column({ default: 0 })
  readTime: number;

  @Column()
  cover_image: string;

  @Column({ default: 0 })
  views: number;

  @OneToMany(() => ContentBlock, (block) => block.blogPost)
  contentBlocks: ContentBlock[];

  @ManyToMany(() => Tag, (tag) => tag.blogPosts)
  @JoinTable()
  tags: Tag[];

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true });
    //   '-' +
    //   ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }
}
