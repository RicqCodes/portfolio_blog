import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchemaUpdates1700000000000 implements MigrationInterface {
  name = 'InitSchemaUpdates1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_blocks" ALTER COLUMN "title" TYPE jsonb USING CASE WHEN "title" IS NULL THEN NULL ELSE to_jsonb("title") END`,
    );

    await queryRunner.query(
      `ALTER TABLE "tags" ADD CONSTRAINT "UQ_tags_name" UNIQUE ("name")`,
    );

    await queryRunner.query(
      `ALTER TABLE "blog_posts" ADD CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug")`,
    );

    const fkRows: Array<{ conname: string }> = await queryRunner.query(
      `
      SELECT conname
      FROM pg_constraint
      INNER JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
      INNER JOIN pg_attribute ON pg_attribute.attrelid = pg_class.oid
        AND pg_attribute.attnum = ANY(pg_constraint.conkey)
      WHERE pg_class.relname = 'content_blocks'
        AND pg_attribute.attname = 'blogPostId'
        AND pg_constraint.contype = 'f'
      `,
    );

    if (fkRows.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "content_blocks" DROP CONSTRAINT "${fkRows[0].conname}"`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD CONSTRAINT "FK_content_blocks_blogPost" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_blocks" DROP CONSTRAINT "FK_content_blocks_blogPost"`,
    );

    await queryRunner.query(
      `ALTER TABLE "blog_posts" DROP CONSTRAINT "UQ_blog_posts_slug"`,
    );

    await queryRunner.query(
      `ALTER TABLE "tags" DROP CONSTRAINT "UQ_tags_name"`,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ALTER COLUMN "title" TYPE text USING CASE WHEN "title" IS NULL THEN NULL ELSE "title"::text END`,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD CONSTRAINT "FK_content_blocks_blogPost" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
