import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../user/database/user.entity';

export enum SocialProviderEnum {
  GOOGLE = 'GOOGLE',
}

@Unique(['social', 'social_id'])
@Entity('user_socials')
export class UserSocial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'enum', enum: SocialProviderEnum })
  social: SocialProviderEnum;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'Идентификатор пользователя в сервисе',
  })
  social_id: string;

  @Column({ type: 'text', nullable: true })
  access_token?: string | null;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string | null;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at: Date;
}
