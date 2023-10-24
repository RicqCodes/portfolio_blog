import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionService } from './database-connection.service';
import { BlogPost } from './entity/post.entity';
import { Tag } from './entity/tag.entity';
import { ContentBlock } from './entity/block.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: DatabaseConnectionService }),
    TypeOrmModule.forFeature([BlogPost, Tag, ContentBlock]),
  ],
  controllers: [PostController, TagController],
  providers: [PostService, TagService],
})
export class AppModule {}
