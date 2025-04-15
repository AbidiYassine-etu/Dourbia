import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Req, Get, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarStorage } from './avatar.config';
import { AuthGuard } from './guards/auth.guard';
import { AvatarService } from './avatar.service';
import { Response } from 'express';
import { join } from 'path';



@Controller('profile')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', avatarStorage))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const user = req.user;
    const avatarUrl = await this.avatarService.updateUserAvatar(user.email, file);
    return { 
      message: 'Avatar uploaded successfully',
      avatarUrl 
    };
  }


  @Get('avatar')
  @UseGuards(AuthGuard)
  async getAvatar(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user;
      const avatarPath = await this.avatarService.getAvatarPath(user.email);
      
      // Send the actual file
      res.sendFile(avatarPath, {
        headers: {
          'Content-Type': this.getMimeType(avatarPath),
          'Cache-Control': 'public, max-age=31536000' // 1 year cache
        }
      });
    } catch (error) {
      res.status(404).json({ message: 'Avatar not found' });
    }
  }

  private getMimeType(filename: string): string {
    const extension = filename?.split('.')?.pop()?.toLowerCase() ?? '';
    switch (extension) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      default: return 'image/jpeg';
    }
  }
}