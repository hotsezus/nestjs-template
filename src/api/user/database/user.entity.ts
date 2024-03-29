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

import { UserAuthToken } from '../../userTokens/userAuthToken.entity';
import { UserReadableFields } from '../common/user.readable-fields';
import { UserAuthPassword } from './userAuthPassword.entity';

@Entity('users')
export class User extends UserReadableFields {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: Date | null;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date | null;

  @Column({ type: 'integer', nullable: true })
  creator_user_id?: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'creator_user_id',
  })
  creator_user?: User | null;

  @OneToMany(() => UserAuthPassword, (password) => password.user)
  authPasswords: UserAuthPassword[];

  @OneToMany(() => UserAuthToken, (token) => token.user)
  authTokens: UserAuthToken[];

  @BeforeInsert()
  @BeforeUpdate()
  convertEmailToLowercase() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }
}
