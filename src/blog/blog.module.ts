// src/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entities/blog.entity';
import { FileUploadModule } from './blog-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blog]),
    FileUploadModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}