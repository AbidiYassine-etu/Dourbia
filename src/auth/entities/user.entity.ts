import { Exclude } from '@nestjs/class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @Column({default: ''})
  avatar: string;

  @Column({
    type: 'enum',
    enum: USERROLES,  
    default: USERROLES.USER,  
  })
  role: USERROLES;

  @Column({nullable: true})
  phone: string;

  @Column({nullable: true})
  country: string;

  @Column({nullable: true})
  region: string;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ nullable: true })
  googleId: string;

}
