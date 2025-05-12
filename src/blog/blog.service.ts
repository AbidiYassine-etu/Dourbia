// src/blog/blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {}

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async create(createBlogDto: CreateBlogDto, image: Express.Multer.File): Promise<Blog> {
    // Convert Windows paths to URL-friendly format
    const imagePath = `blogs/${image.filename}`.replace(/\\/g, '/');
    
    const blog = this.blogRepository.create({
      ...createBlogDto,
      readingTime: this.calculateReadingTime(createBlogDto.text),
      imagePath, // Should now be "blogs/filename.jpg"
      publishDate: new Date(),
    });
  
    return this.blogRepository.save(blog);
  }
  

  findAll(): Promise<Blog[]> {
    return this.blogRepository.find();
  }

// src/blog/blog.service.ts
async findOne(id: string): Promise<Blog> {
  const blog = await this.blogRepository.findOneBy({ id });
  if (!blog) {
    throw new NotFoundException(`Blog with ID ${id} not found`);
  }
  return blog;
}

// Update method
async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
  const blog = await this.blogRepository.preload({
    id,
    ...updateBlogDto,
    ...(updateBlogDto.text && { readingTime: this.calculateReadingTime(updateBlogDto.text) }),
  });
  
  if (!blog) {
    throw new NotFoundException(`Blog with ID ${id} not found`);
  }
  
  return this.blogRepository.save(blog);
}

// Remove method
async remove(id: string): Promise<void> {
  const result = await this.blogRepository.delete(id);
  if (result.affected === 0) {
    throw new NotFoundException(`Blog with ID ${id} not found`);
  }
}
}