import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
// import { JwtStrategy } from './jwt.strategy'; 
 /* this is just some changes to push to git */

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Pour les entités User
    PassportModule.register({ defaultStrategy: 'jwt' }), // Ajouter Passport pour gérer les stratégies
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // La clé secrète pour signer les tokens JWT
      signOptions: { expiresIn: '1h' }, // Le token expirera dans 1 heure
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService], // Ajouter JwtStrategy dans les providers
  exports: [AuthService, PassportModule, JwtModule], // Exposer les services nécessaires pour d'autres modules
})
export class AuthModule {}
