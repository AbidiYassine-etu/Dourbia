import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email/email.module';
import { VerificationModule } from './verification/verification.module';
import { ContactModule } from './contact/contact.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BlogModule } from './blog/blog.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads', 'avatars'),
      serveRoot: '/avatars',
    },
    {
      rootPath: join(__dirname, '..', 'uploads', 'blogs'),
      serveRoot: '/blogs',
    },), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'yassine150',
      database: 'dourbia',
      autoLoadEntities: true,
      synchronize: true,
      logging:true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    AuthModule,
    EmailModule,
    VerificationModule,
    ContactModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}