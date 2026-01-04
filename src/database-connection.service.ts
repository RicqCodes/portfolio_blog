import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConnectionService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(
    connectionName?: string,
  ): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    const shouldSync = process.env.TYPEORM_SYNCHRONIZE === 'true';
    const shouldLog = process.env.TYPEORM_LOGGING === 'true';

    return {
      name: connectionName,
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DB,
          }),
      synchronize: shouldSync,
      dropSchema: false,
      logging: shouldLog,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }
}
