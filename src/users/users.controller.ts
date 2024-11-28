import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

import { Roles } from '@utils/roles/roles.decorator';
import { Role } from '@utils/roles/roles.enum';
import { RolesGuard } from '@utils/roles/roles.guard';
import { JwtAuthenticatedRequest } from '@utils/types/auth-types';
import { UserWithoutPassword } from '@utils/types/users-types';
import { ZodValidationPipe } from '@utils/validation/zod-validation.pipe';

import { CreateUserDTO, createUserSchema } from './dto/create-user.dto';
import { UpdateUserDTO, updateUserSchema } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ type: UserWithoutPassword })
  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDTO: CreateUserDTO) {
    return this.usersService.create(createUserDTO);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserWithoutPassword, isArray: true })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserWithoutPassword })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: JwtAuthenticatedRequest) {
    return this.usersService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserWithoutPassword })
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @Req() req: JwtAuthenticatedRequest,
  ) {
    return this.usersService.update(id, updateUserDTO, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserWithoutPassword })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: JwtAuthenticatedRequest) {
    return this.usersService.remove(id, req.user);
  }
}
