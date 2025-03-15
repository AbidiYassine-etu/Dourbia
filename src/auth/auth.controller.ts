import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import { SigninDto } from './dto/signin.dto'; 
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


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

@Post('verify/:otp')
@ApiOperation({ summary: 'Vérifier l\'email avec OTP' })
@ApiParam({ name: 'otp', description: 'Code OTP reçu par email' })
@ApiBody({ 
  schema: {
    type: 'object',
    properties: { email: { type: 'string' } }
  }
})
@ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
@ApiResponse({ status: 422, description: 'OTP invalide ou expiré' })
async verifyEmail(
  @Param('otp') otp: string,
  @Body('email') email: string
) {
  const user = await this.authService.findUserByEmail(email);
  const result = await this.authService.verifyEmail(user.id, otp);
  return { status: result ? 'success' : 'failure' };
}

}
