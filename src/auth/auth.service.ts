import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { UsersService } from '@users/users.service';

import { JwtPayload, LocalUser } from '@utils/types/auth-types';

import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDTO: LoginDTO) {
    const { username, password } = loginDTO;

    const user = await this.usersService.findByUsername(username);
    const hashMatch = await compare(password, user.password);

    if (!user || !hashMatch) {
      return null;
    }

    const { password: _userPassword, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async login(user: LocalUser) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
