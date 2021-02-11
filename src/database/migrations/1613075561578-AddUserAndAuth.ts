import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndAuth1613075561578 implements MigrationInterface {
  name = 'AddUserAndAuth1613075561578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_auth_passwords" ("id" SERIAL NOT NULL, "hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "user_id" integer, CONSTRAINT "PK_968d9713782df528f27077f60e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "user_auth_tokens_type_enum" AS ENUM('REFRESH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_auth_tokens" ("id" SERIAL NOT NULL, "type" "user_auth_tokens_type_enum" NOT NULL, "token" character varying(1024) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE, "user_id" integer, "device_metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_e15c7c76bf967080b272104d828" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM('DEFAULT', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("login" character varying(255), "email" character varying(255), "name" character varying(255), "role" "users_role_enum" NOT NULL DEFAULT 'DEFAULT', "id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "creator_user_id" integer, CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_passwords" ADD CONSTRAINT "FK_63d7993e81a151ec988e6f9bd47" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_tokens" ADD CONSTRAINT "FK_bab7def1955bd13dcc47c036c03" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_fdb0081b8a032125282add5dfee" FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_fdb0081b8a032125282add5dfee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_tokens" DROP CONSTRAINT "FK_bab7def1955bd13dcc47c036c03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_auth_passwords" DROP CONSTRAINT "FK_63d7993e81a151ec988e6f9bd47"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
    await queryRunner.query(`DROP TABLE "user_auth_tokens"`);
    await queryRunner.query(`DROP TYPE "user_auth_tokens_type_enum"`);
    await queryRunner.query(`DROP TABLE "user_auth_passwords"`);
  }
}
