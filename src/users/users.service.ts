import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { eq, InferInsertModel, sql } from 'drizzle-orm';

import { users } from '@database/database.schema';
import { DrizzleService } from '@database/drizzle.service';

import { isDBError } from '@utils/database-utils';
import { JwtUser } from '@utils/types/auth-types';
import { UserWithoutPasswordReturn } from '@utils/types/users-types';

import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  userWithtoutPasswordReturn: UserWithoutPasswordReturn<typeof users> = {
    id: users.id,
    username: users.username,
    role: users.role,
    updated_at: users.updated_at,
    created_at: users.created_at,
  };

  async create(createUserDTO: CreateUserDTO) {
    const usersQuery = this.drizzleService.db
      .insert(users)
      .values({
        username: sql.placeholder('username'),
        password: sql.placeholder('password'),
      })
      .returning(this.userWithtoutPasswordReturn)
      .prepare('create_user');

    const { password, ...createUserDTOWithoutPassword } = createUserDTO;

    const hashedPassword = await hash(password, 10);

    const createUserPayload: InferInsertModel<typeof users> = {
      ...createUserDTOWithoutPassword,
      password: hashedPassword,
    };

    const createdUsers = await usersQuery
      .execute(createUserPayload)
      .catch((err) => {
        if (isDBError(err) && err.code === '23505') {
          return new BadRequestException('Username already exists');
        }

        return new Error();
      });

    if (createdUsers instanceof Error) {
      throw createdUsers;
    }

    return createdUsers[0];
  }

  async findAll() {
    const usersQuery = this.drizzleService.db.query.users
      .findMany({ columns: { password: false } })
      .prepare('find_all_users');

    const foundUsers = await usersQuery.execute();

    return foundUsers;
  }

  async findOne(id: string, reqUser: JwtUser) {
    if (reqUser.role !== 'admin' && reqUser.id !== id) {
      throw new UnauthorizedException('You can only see your data');
    }

    const userQuery = this.drizzleService.db.query.users
      .findFirst({
        where: eq(users.id, sql.placeholder('id')),
        columns: { password: false },
      })
      .prepare('find_one_user');

    const user = await userQuery.execute({ id });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string) {
    const userQuery = this.drizzleService.db.query.users
      .findFirst({
        where: eq(users.username, sql.placeholder('username')),
      })
      .prepare('find_user_by_username');

    const user = await userQuery.execute({ username });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDTO: UpdateUserDTO, reqUser: JwtUser) {
    if (reqUser.role !== 'admin' && reqUser.id !== id) {
      throw new UnauthorizedException('You can only update your data');
    }

    if (reqUser.role !== 'admin' && updateUserDTO.role === 'admin') {
      throw new UnauthorizedException(
        `Only admin users can update the role property`,
      );
    }

    const usersQuery = this.drizzleService.db
      .update(users)
      .set({
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        username: updateUserDTO.username
          ? sql.placeholder('username')
          : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        password: updateUserDTO.password
          ? sql.placeholder('password')
          : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        role: updateUserDTO.role ? sql.placeholder('role') : undefined,
        updated_at: new Date(),
      })
      .where(eq(users.id, sql.placeholder('id')))
      .returning(this.userWithtoutPasswordReturn)
      .prepare('update_user');

    const { password, ...updateUserDTOWithoutPassword } = updateUserDTO;

    let hashedPassword;

    if (password) {
      hashedPassword = await hash(password, 10);
    }

    const updateUserPayload: Partial<InferInsertModel<typeof users>> = {
      ...updateUserDTOWithoutPassword,
      password: hashedPassword,
      id,
    };

    const updatedUsers = await usersQuery.execute(updateUserPayload);

    if (updatedUsers.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUsers[0];
  }

  async remove(id: string, reqUser: JwtUser) {
    if (reqUser.role !== 'admin' && reqUser.id !== id) {
      throw new UnauthorizedException('You can only delete your data');
    }

    const usersQuery = this.drizzleService.db
      .delete(users)
      .where(eq(users.id, sql.placeholder('id')))
      .returning(this.userWithtoutPasswordReturn)
      .prepare('delete_user');

    const deletedUsers = await usersQuery.execute({ id });

    if (deletedUsers.length === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return deletedUsers[0];
  }
}
