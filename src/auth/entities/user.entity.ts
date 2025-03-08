import { Exclude } from '@nestjs/class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;
 /* this is just some changes to push to git */

  @Column({ })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  avatar: string;
}