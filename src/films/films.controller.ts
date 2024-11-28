import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "@auth/guards/jwt-auth.guard";

import { Roles } from "@utils/roles/roles.decorator";
import { Role } from "@utils/roles/roles.enum";
import { RolesGuard } from "@utils/roles/roles.guard";

import { CreateFilmDto } from "./dto/create-film.dto";
import { UpdateFilmDto } from "./dto/update-film.dto";
import { FilmsService } from "./films.service";

@ApiTags("films")
@Controller("films")
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateFilmDto })
  @Post()
  create(@Body() createFilmDto: CreateFilmDto) {
    return this.filmsService.create(createFilmDto);
  }

  @ApiCreatedResponse({ type: CreateFilmDto, isArray: true })
  @ApiQuery({
    name: "keyword",
    type: String,
    description: "Keyword to search",
    required: false,
  })
  @Get()
  findAll(@Query("keyword") keyword?: string) {
    return this.filmsService.findAll(keyword);
  }

  @ApiCreatedResponse({ type: CreateFilmDto })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.filmsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateFilmDto })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return this.filmsService.update(id, updateFilmDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateFilmDto })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.filmsService.remove(id);
  }
}
