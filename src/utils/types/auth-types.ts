import { ApiProperty } from '@nestjs/swagger';

import { LocalStrategy } from '@auth/strategies/local.strategy';

import { Role } from '@utils/roles/roles.enum';

export type LocalUser = Awaited<ReturnType<LocalStrategy['validate']>>;

export type JwtUser = {
  id: string;
  username: string;
  role: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  role: string;
};

export type JwtAuthenticatedRequest = Request & { user: JwtUser };

export type LocalAuthenticatedRequest = Request & {
  user: LocalUser;
};

export class AccessToken {
  @ApiProperty()
  access_token: string;
}

export class AuthenticatedUserInfos implements JwtUser {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ enum: Role })
  role: Role;
}
