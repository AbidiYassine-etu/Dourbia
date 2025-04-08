import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { SigninDto } from './dto/signin.dto'; 
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordFinalDto } from './dto/reset-password-final.dto';
import { GoogleAuthGuard } from './google-auth-guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly jwtService : JwtService
  ) {}
  


  @Post('signup')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }


  @Post('signin')
  @ApiOperation({ summary: 'Connexion de l\'utilisateur' })
  @ApiBody({ type: SigninDto })  
  @ApiResponse({ status: 200, description: 'Utilisateur connecté avec succès' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async signin(@Body() signinDto: SigninDto) {  
      return this.authService.signin(signinDto);
  }


  @Post('create')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('getAll')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  findAll() {
    return this.authService.findAll();
  }

  @Get('get/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(+id, updateUserDto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Successfully retrieved user profile.', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async profile(@Req() req): Promise<User> {
      return this.authService.getProfile(req.user.id);
  }

@Post('verification-otp')
@ApiOperation({ summary: 'Générer un OTP pour la vérification email' })
@ApiBody({ 
  schema: {
    type: 'object',
    properties: { email: { type: 'string' } }
  }
})
@ApiResponse({ status: 200, description: 'OTP généré avec succès' })
@ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
async generateEmailVerification(@Body('email') email: string) {
  const user = await this.authService.findUserByEmail(email);
  await this.authService.generateEmailVerification(user.id);
  return { status: 'success', message: 'Email envoyé' };
}

@Post('verify-email/:otp')
@ApiOperation({ summary: "Vérifier l'email avec OTP" })
@ApiParam({ name: 'otp', description: 'Code OTP reçu par email' })
@ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
@ApiResponse({ status: 422, description: 'OTP invalide ou expiré' })
async verifyEmail(@Param('otp') otp: string) {
  await this.authService.verifyEmailWithOtp(otp);
  return { 
    status: 'success',
    message: 'Votre email a été vérifié avec succès'
  };
}

@Patch('toggle-ban/:id')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Bannir/Débannir un utilisateur' })
@ApiParam({ name: 'id', description: "ID de l'utilisateur" })
async toggleBan(@Param('id') id: string) {
  const user = await this.authService.toggleBan(+id);
  return {
    status: 'success',
    message: user.isBanned ? 'Utilisateur banni' : 'Utilisateur débanni',
    user
  };
}

@Post('password/send-code')
@ApiOperation({ summary: 'Envoyer un code de réinitialisation de mot de passe' })
@ApiResponse({ status: 200, description: 'Code envoyé avec succès' })
@ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
async sendPasswordResetCode(@Body() resetPasswordDto: ResetPasswordDto) {
  return this.authService.generatePasswordResetOTP(resetPasswordDto.email);
}

@Post('password/verify-code/:otp')
@ApiOperation({ summary: 'Vérifier le code de réinitialisation de mot de passe' })
@ApiParam({ name: 'otp', description: 'Code OTP reçu par email' })
@ApiResponse({ status: 200, description: 'Code vérifié avec succès' })
@ApiResponse({ status: 422, description: 'Code invalide ou expiré' })
async verifyPasswordResetCode(@Param('otp') otp: string) {
  const isValid = await this.authService.verifyPasswordResetOTP(otp);
  return { 
    status: 'success',
    message: 'Code vérifié avec succès'
  };
}

@Post('password/reset')
@ApiOperation({ summary: 'Réinitialiser le mot de passe' })
@ApiResponse({ status: 200, description: 'Mot de passe réinitialisé avec succès' })
@ApiResponse({ status: 422, description: 'Erreur de réinitialisation' })
async resetPassword(@Body() resetPasswordFinalDto: ResetPasswordFinalDto) {
  const success = await this.authService.resetPassword(resetPasswordFinalDto.newPassword);
  return { 
    status: 'success',
    message: 'Mot de passe réinitialisé avec succès'
  };
}

//Google Auth Route
@Get('google')
@UseGuards(GoogleAuthGuard)
async googleAuth() {
  //redirects you to Google Auth Route
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthRedirect(@Req() req, @Res() res) {
  try {
    
    const user = req.user;

    const payload = { 
      email: user.email, 
      sub: user.googleId,
      name: user.name 
    };

    const jwt = this.jwtService.sign(payload);

    // Set JWT as a secure, HTTP-only cookie
    res.cookie('access_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      sameSite: 'lax', // or 'strict' for more protection
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    //adhouma fil front 
    //loula ki tsir success wel thenya fil error
    // Redirect to the frontend (token is in cookie, not in URL)
    res.redirect('http://localhost:3000/auth-success');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(`http://localhost:3000/auth-error?message=${error.message}`);
  }
}

}
