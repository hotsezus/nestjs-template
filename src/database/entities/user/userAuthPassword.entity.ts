import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('user_auth_passwords')
export class UserAuthPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.authPasswords, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  hash: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: Date;
}
