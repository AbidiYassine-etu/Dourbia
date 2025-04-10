import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private jwtService: JwtService,
      private userService: AuthService
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: 'http://localhost:8000/auth/google/callback',
            scope:['email', 'profile'],
            passReqToCallback: true,  // Add this
            accessType: 'offline',     // Add for refresh tokens
            prompt: 'consent'  ,        // Forces fresh token
               });

               
    }
    
    async validate(
  
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
    ): Promise<any> {
      const datenow = new Date();
      const email = profile.emails?.[0]?.value;
    
      if (!email) {
        throw new Error('Email not found in Google profile');
      }
    
      // Check if user exists
      let user = await this.userService.findByEmail(email);
    
      if (!user) {
        user = await this.userService.createUserLoggedInByGoogle({
          email,
          username: profile.displayName || email.split('@')[0],
          googleId: profile.id,
          password: '', // empty since Google handles auth
          country: '',
          region: '',
          emailVerifiedAt: datenow,
          avatar: profile.photos?.[0]?.value || '',
        });
      }
    
      return {
        id: user.id,
        email: user.email,
        name: user.username,
        googleId: user.googleId,
        accessToken,
        refreshToken,
      };
    }
    
      
}