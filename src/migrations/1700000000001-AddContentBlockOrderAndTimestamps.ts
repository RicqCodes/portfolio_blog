import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContentBlockOrderAndTimestamps1700000000001
  implements MigrationInterface
{
  name = 'AddContentBlockOrderAndTimestamps1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD "order" integer NOT NULL DEFAULT 1`,
    );

    await queryRunner.query(
      `
      UPDATE "content_blocks" AS cb
      SET "order" = ranked.row_number
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY "blogPostId" ORDER BY id) AS row_number
        FROM "content_blocks"
      ) AS ranked
      WHERE cb.id = ranked.id
      `,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ALTER COLUMN "order" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      `ALTER TABLE "content_blocks" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      `ALTER TABLE "tags" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(
      `ALTER TABLE "tags" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "content_blocks" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_blocks" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(`ALTER TABLE "content_blocks" DROP COLUMN "order"`);
  }
}
