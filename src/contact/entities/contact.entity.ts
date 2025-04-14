import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class Contact {
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column({ nullable: false })
      nom: string;
    
      @Column({nullable: false})
      phone: String;

      @Column({nullable: false})
      email: string;
    
      @Column({nullable: false})
      object: string;
    
      @Column({nullable: false})
      message: string;
}
