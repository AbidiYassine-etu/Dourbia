import { Exclude } from '@nestjs/class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { USERROLES } from '../../utils/enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  avatar: string;

  @Column({
    type: 'enum',
    enum: USERROLES,  
    default: USERROLES.USER,  
  })
  role: USERROLES;

  @Column()
  phone: string;

  @Column()
  country: string;

  @Column()
  region: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;
}
