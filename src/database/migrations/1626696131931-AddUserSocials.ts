import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserSocials1626696131931 implements MigrationInterface {
    name = 'AddUserSocials1626696131931'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "user_socials_social_enum" AS ENUM('GOOGLE')`);
        await queryRunner.query(`CREATE TABLE "user_socials" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "social" "user_socials_social_enum" NOT NULL, "social_id" character varying(255) NOT NULL, "access_token" text, "refresh_token" text, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_adc1c2d5d391172f253563e422a" UNIQUE ("social", "social_id"), CONSTRAINT "PK_b83c619b4b264f307240eb419ec" PRIMARY KEY ("id")); COMMENT ON COLUMN "user_socials"."social_id" IS 'Идентификатор пользователя в сервисе'`);
        await queryRunner.query(`ALTER TABLE "user_socials" ADD CONSTRAINT "FK_5c54c2fb2b23d26200fe67514bd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_socials" DROP CONSTRAINT "FK_5c54c2fb2b23d26200fe67514bd"`);
        await queryRunner.query(`DROP TABLE "user_socials"`);
        await queryRunner.query(`DROP TYPE "user_socials_social_enum"`);
    }

}
