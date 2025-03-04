import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'yassine150',
      database: 'todo_app',
      autoLoadEntities: true,
      synchronize: true,
      logging:true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}