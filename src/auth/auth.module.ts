import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy'; 
import { AuthGuard } from './guards/auth.guard'; 
import { EmailModule } from 'src/email/email.module';
import { VerificationModule } from 'src/verification/verification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
    PassportModule.register({ defaultStrategy: 'jwt' }), 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', 
      signOptions: { expiresIn: '1h' }, 
    }),
    EmailModule,
    VerificationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, 
    AuthGuard,
  ], 
  exports: [
    AuthService, 
    PassportModule, 
    JwtModule, 
    JwtStrategy, 
    AuthGuard, 
  ], 
})
export class AuthModule {}
