// src/blog/entities/blog.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

@Column({ 
    name: 'image_path',
    type: 'varchar', 
    nullable: false
  })
  imagePath: string; 
  
  @Column('text')
  text: string;

  @Column({ name: 'reading_time' })
  readingTime: number;

  @Column({ name: 'publish_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  publishDate: Date;
}