// verification-token.entity.ts
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { User } from '../../auth/entities/user.entity';
  
  @Entity()
  export class Verification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;
  
    @ManyToOne(() => User)
    user: User;
  
    @Column()
    token: string;
  
    @Column()
    expiresAt: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  }