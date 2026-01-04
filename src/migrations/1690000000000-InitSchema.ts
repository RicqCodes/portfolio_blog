import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1690000000000 implements MigrationInterface {
  name = 'InitSchema1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ exists }] = await queryRunner.query(
      `SELECT to_regclass('public.blog_posts') IS NOT NULL AS "exists"`,
    );

    if (exists) {
      return;
    }

    await queryRunner.query(
      `CREATE TYPE "content_blocks_type_enum" AS ENUM ('text', 'heading', 'divider', 'image', 'video', 'code', 'list')`,
    );

    await queryRunner.query(
      `CREATE TABLE "blog_posts" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "slug" character varying NOT NULL, "readTime" integer NOT NULL DEFAULT '0', "cover_image" character varying NOT NULL, "views" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_blog_posts_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_blog_posts_title" UNIQUE ("title"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `CREATE TABLE "content_blocks" ("id" SERIAL NOT NULL, "type" "content_blocks_type_enum" NOT NULL, "title" text, "content" text, "list" jsonb, "links" jsonb, "imageUrl" character varying, "codeType" character varying, "blogPostId" integer, CONSTRAINT "PK_content_blocks_id" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD CONSTRAINT "FK_content_blocks_blogPost" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "blog_posts_tags_tags" ("blogPostsId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "PK_blog_posts_tags_tags" PRIMARY KEY ("blogPostsId", "tagsId"))`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_tags_tags_blogPostsId" ON "blog_posts_tags_tags" ("blogPostsId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_tags_tags_tagsId" ON "blog_posts_tags_tags" ("tagsId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "blog_posts_tags_tags" ADD CONSTRAINT "FK_blog_posts_tags_tags_blogPosts" FOREIGN KEY ("blogPostsId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "blog_posts_tags_tags" ADD CONSTRAINT "FK_blog_posts_tags_tags_tags" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_posts_tags_tags" DROP CONSTRAINT IF EXISTS "FK_blog_posts_tags_tags_tags"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_posts_tags_tags" DROP CONSTRAINT IF EXISTS "FK_blog_posts_tags_tags_blogPosts"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_blog_posts_tags_tags_tagsId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_blog_posts_tags_tags_blogPostsId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_posts_tags_tags"`);
    await queryRunner.query(
      `ALTER TABLE "content_blocks" DROP CONSTRAINT IF EXISTS "FK_content_blocks_blogPost"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "content_blocks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_posts"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "content_blocks_type_enum"`,
    );
  }
}
