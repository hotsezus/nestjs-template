import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { UserAuthTokenFields } from './userAuthTokenFields';

/**
 * Модель системных токенов пользователя
 * $module {Модуль личного кабинета}
 */
@Entity('user_auth_tokens')
export class UserAuthToken extends UserAuthTokenFields {
  @ManyToOne(() => User, (user) => user.authTokens, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'jsonb', nullable: true })
  device_metadata: any;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date;
}
