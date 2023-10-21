import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogPost } from './post.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => BlogPost, (blogPost) => blogPost.tags)
  blogPosts: BlogPost[];
}
