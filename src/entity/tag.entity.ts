import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { BlogPost } from './post.entity';
import { AbstractEntity } from './abstract.entity';

@Entity('tags')
export class Tag extends AbstractEntity {
  @Column({ unique: true })
  @Index()
  name: string;

  @ManyToMany(() => BlogPost, (blogPost) => blogPost.tags)
  blogPosts: BlogPost[];
}
