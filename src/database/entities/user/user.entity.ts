import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserAuthPassword } from './userAuthPassword.entity';
import { UserAuthToken } from './userAuthToken.entity';
import { UserFields } from './userFields';

@Entity('users')
export class User extends UserFields {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date;

  @Column({ type: 'integer', nullable: true })
  creator_user_id?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'creator_user_id',
  })
  creator_user?: User;

  @OneToMany(() => UserAuthPassword, (password) => password.user)
  authPasswords: UserAuthPassword[];

  @OneToMany(() => UserAuthToken, (token) => token.user)
  authTokens: UserAuthToken[];

  @BeforeInsert()
  @BeforeUpdate()
  convertEmailToLowercase() {
    this.email = this.email && this.email.toLowerCase();
  }
}
