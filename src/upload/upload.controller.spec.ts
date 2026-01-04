import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { mkdirSync, rmSync } from 'fs';
import * as request from 'supertest';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UploadController', () => {
  let app: INestApplication;
  const uploadService = {
    uploadImage: jest.fn(),
  };
  const uploadsDir = 'uploads-test';

  beforeAll(async () => {
    process.env.UPLOADS_DIR = uploadsDir;
    mkdirSync(uploadsDir, { recursive: true });

    const moduleRef = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: uploadService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    rmSync(uploadsDir, { recursive: true, force: true });
    delete process.env.UPLOADS_DIR;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads an image and returns the public URL', async () => {
    uploadService.uploadImage.mockResolvedValue({
      url: 'https://example.com/image.jpg',
      publicId: 'blog-posts/test',
    });

    const response = await request(app.getHttpServer())
      .post('/upload/image')
      .attach('file', Buffer.from([0xff, 0xd8, 0xff]), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      url: 'https://example.com/image.jpg',
      publicId: 'blog-posts/test',
    });
    expect(uploadService.uploadImage).toHaveBeenCalledTimes(1);
  });

  it('rejects non-image uploads', async () => {
    const response = await request(app.getHttpServer())
      .post('/upload/image')
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body?.message).toBe('Only image uploads are allowed');
  });
});
