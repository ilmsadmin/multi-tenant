import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserDataTable1684267200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng user_data
    await queryRunner.createTable(
      new Table({
        name: 'user_data',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'key',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: true,
            default: "'active'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Tạo foreign key
    await queryRunner.createForeignKey(
      'user_data',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Tạo index
    await queryRunner.query(`CREATE INDEX "IDX_USER_DATA_USER_ID" ON "user_data" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_USER_DATA_CATEGORY" ON "user_data" ("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_USER_DATA_KEY" ON "user_data" ("key")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_USER_DATA_USER_CATEGORY_KEY" ON "user_data" ("user_id", "category", "key")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các index
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_DATA_USER_CATEGORY_KEY"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_DATA_KEY"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_DATA_CATEGORY"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USER_DATA_USER_ID"`);    // Xóa foreign key và bảng
    const table = await queryRunner.getTable('user_data');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_data', foreignKey);
      }
    }
    await queryRunner.dropTable('user_data');
  }
}
