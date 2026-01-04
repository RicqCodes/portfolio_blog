import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, process.env.UPLOADS_DIR || 'uploads');
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          const safeBase = file.originalname
            .replace(ext, '')
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .slice(0, 50);
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${safeBase || 'image'}-${unique}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          return cb(
            new BadRequestException('Only image uploads are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const baseUrl =
      process.env.PUBLIC_BASE_URL ||
      `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;
    return this.uploadService.uploadImage(file, baseUrl);
  }

  @Delete('image')
  async deleteImage(@Body() body: { url?: string; publicId?: string }) {
    return this.uploadService.deleteImage(body);
  }
}
