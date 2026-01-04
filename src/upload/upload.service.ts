import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, posix, resolve } from 'path';

@Injectable()
export class UploadService {
  private getUploadsPath() {
    const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
    return uploadsDir.startsWith('/') ? uploadsDir : join(process.cwd(), uploadsDir);
  }

  async uploadImage(file: Express.Multer.File, baseUrl: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.filename) {
      throw new BadRequestException('Upload failed');
    }
    if (!baseUrl) {
      throw new BadRequestException('Missing public base URL');
    }

    const publicPath = (process.env.UPLOADS_PUBLIC_PATH || '/uploads').replace(
      /\/$/,
      '',
    );
    const url = `${baseUrl}${publicPath}/${file.filename}`;
    return {
      url,
      publicId: posix.join(publicPath.replace(/^\//, ''), file.filename),
    };
  }

  async deleteImage({
    url,
    publicId,
  }: {
    url?: string;
    publicId?: string;
  }) {
    const publicPath = (process.env.UPLOADS_PUBLIC_PATH || '/uploads').replace(
      /\/$/,
      '',
    );
    let target = publicId || '';

    if (!target && url) {
      try {
        const parsedUrl = new URL(url);
        target = parsedUrl.pathname || '';
      } catch {
        target = url;
      }
    }

    if (!target) {
      throw new BadRequestException('Missing image reference');
    }

    const publicPrefix = publicPath.replace(/^\//, '');
    target = target.replace(/^\//, '');
    if (target.startsWith(publicPrefix + '/')) {
      target = target.slice(publicPrefix.length + 1);
    }

    const uploadsPath = this.getUploadsPath();
    const resolvedPath = resolve(uploadsPath, target);
    if (!resolvedPath.startsWith(uploadsPath)) {
      throw new BadRequestException('Invalid image path');
    }

    try {
      await fs.unlink(resolvedPath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        throw new BadRequestException('Failed to delete image');
      }
    }

    return { status: 'ok' };
  }
}
