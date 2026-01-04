import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTagNameIndex1700000000002 implements MigrationInterface {
  name = 'AddTagNameIndex1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_tags_name" ON "tags" ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tags_name"`);
  }
}
