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

import { CreateLivreDto } from "./dto/create-livre.dto";
import { UpdateLivreDto } from "./dto/update-livre.dto";
import { livreService } from "./livre.service";

@ApiTags("films")
@Controller("films")
export class LivreController {
  constructor(private readonly livreService: livreService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateLivreDto })
  @Post()
  create(@Body() createFilmDto: CreateLivreDto) {
    return this.livreService.create(createFilmDto);
  }

  @ApiCreatedResponse({ type: CreateLivreDto, isArray: true })
  @ApiQuery({
    name: "keyword",
    type: String,
    description: "Keyword to search",
    required: false,
  })
  @Get()
  findAll(@Query("keyword") keyword?: string) {
    return this.livreService.findAll(keyword);
  }

  @ApiCreatedResponse({ type: CreateLivreDto })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.livreService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateLivreDto })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFilmDto: UpdateLivreDto) {
    return this.livreService.update(id, updateFilmDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateLivreDto })
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.livreService.remove(id);
  }
}
