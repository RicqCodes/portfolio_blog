import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for specific origins
  app.enableCors({
    origin: [
      'https://ricqcodes.dev',
      'https://www.ricqcodes.dev',
      'https://admin.ricqcodes.dev',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        type ValidationDetail = {
          path: string;
          constraints: Record<string, string> | undefined;
          value?: unknown;
          type?: string;
        };

        const flatten = (
          errorList: ValidationError[],
          parentPath = '',
        ): ValidationDetail[] => {
          return errorList.flatMap((error) => {
            const path = parentPath
              ? `${parentPath}.${error.property}`
              : error.property;
            const details: ValidationDetail[] = [
              {
                path,
                constraints: error.constraints,
                value: error.value,
                type:
                  typeof error.value === 'object' &&
                  error.value &&
                  'type' in (error.value as Record<string, unknown>)
                    ? String(
                        (error.value as Record<string, unknown>).type ?? '',
                      )
                    : undefined,
              },
            ];
            if (error.children?.length) {
              return [...details, ...flatten(error.children, path)];
            }
            return details;
          });
        };

        const details = flatten(errors).filter(
          (detail) => detail.constraints && Object.keys(detail.constraints).length,
        );
        console.error('Validation failed', details);

        return new BadRequestException({
          message: details.flatMap((detail) =>
            Object.values(detail.constraints || {}).map(
              (constraint) =>
                `${detail.path}${detail.type ? `(${detail.type})` : ''}: ${constraint}`,
            ),
          ),
          errors: details,
        });
      },
    }),
  );

  const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
  const uploadsPath = uploadsDir.startsWith('/')
    ? uploadsDir
    : join(process.cwd(), uploadsDir);
  mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // Serve static files from admin/dist in production
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '..', 'admin', 'dist'), {
      prefix: '/admin',
    });

    // Fallback to index.html for SPA routing
    app.use('/admin/*', (req, res) => {
      res.sendFile(join(__dirname, '..', 'admin', 'dist', 'index.html'));
    });
  }

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
