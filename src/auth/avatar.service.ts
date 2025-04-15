import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service'; // Assume you have a user service
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AvatarService {
  constructor(private readonly userService: AuthService) {}

  async updateUserAvatar(email: string, file: Express.Multer.File) {
    const user = await this.userService.findUserByEmail(email);
    
    // Delete old avatar if exists
    if (user.avatar) {
      try {
        unlinkSync(join(process.cwd(), 'uploads/avatars', user.avatar));
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    // Update user record
    const updatedUser = await this.userService.updateUserByEmail(email, {
      avatar: file.filename
    });

    return `${process.env.BASE_URL}/avatars/${file.filename}`;
  }

  async getAvatarPath(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    
    if (!user?.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    const path = join(process.cwd(), 'uploads/avatars', user.avatar);
    
    if (!existsSync(path)) {
      throw new NotFoundException('Avatar file not found');
    }

    return path;
  }
}