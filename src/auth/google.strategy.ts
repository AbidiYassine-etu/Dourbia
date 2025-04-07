import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private jwtService: JwtService) {
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
        profile: any
      ) {
        console.log('Google Profile:', JSON.stringify(profile, null, 2));
        if (!profile || !profile.id || !profile.emails?.[0]?.value) {
          throw new Error('Invalid Google profile structure');
        }
      
        const { id, displayName, emails } = profile;
      
        return {
          googleId: id,
          email: emails[0].value,
          name: displayName || emails[0].value.split('@')[0],
          accessToken,
          refreshToken
        };
      }
      
}