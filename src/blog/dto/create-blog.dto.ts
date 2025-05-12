// src/blog/dto/create-blog.dto.ts
import { IsDateString, IsNotEmpty, IsString,IsOptional } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsDateString()
  @IsOptional()
  publishDate?: Date;
}