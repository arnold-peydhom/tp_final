import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import {
  AccessToken,
  JwtAuthenticatedRequest,
  LocalAuthenticatedRequest,
  AuthenticatedUserInfos,
} from '@utils/types/auth-types';

import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiOkResponse({ type: AccessToken })
  @HttpCode(200)
  @Post('login')
  async login(@Req() req: LocalAuthenticatedRequest, @Body() _: LoginDTO) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthenticatedUserInfos })
  @Get('profile')
  async getProfile(@Req() req: JwtAuthenticatedRequest) {
    return req.user;
  }
}
