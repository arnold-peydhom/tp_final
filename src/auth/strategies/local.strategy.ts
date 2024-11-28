import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { fromError } from 'zod-validation-error';

import { LoginDTO, loginSchema } from '@auth/dto/login.dto';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: unknown, password: unknown) {
    let parsedCredentials: LoginDTO;

    try {
      parsedCredentials = loginSchema.parse({ username, password });
    } catch (error) {
      throw new BadRequestException(fromError(error).toString());
    }

    const user = await this.authService.validateUser(parsedCredentials);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials or user not found');
    }

    return user;
  }
}
