import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '111111',
  database: 'taskmanagement',
  entities: [__dirname + '/../**/*.entity.{js,ts}'], // up one folder, any folder, any file .entity, either ends in js/ts
  synchronize: true // do not set is as true on production
};