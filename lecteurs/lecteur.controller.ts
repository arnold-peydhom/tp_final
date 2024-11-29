import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

import { Roles } from '@utils/roles/roles.decorator';
import { Role } from '@utils/roles/roles.enum';
import { RolesGuard } from '@utils/roles/roles.guard';
import { Lecteur } from './entities/lecteur.entity';
import { LecteurService } from './lecteur.service';
import { CreateLecteurDto } from './dto/create-lecteur.dto';
import { UpdateLecteurDto } from './dto/update-lecteur.dto'; 

@ApiTags('Lecteur')
@Controller('Lecteur')
export class LecteurController {
  constructor(private readonly lecteurService: LecteurService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Lecteur })
  @Post()
  create(@Body() createLecteurDto: CreateLecteurDto) {
    return this.lecteurService.create(createLecteurDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Lecteur, isArray: true })
  @ApiQuery({
    name: "keyword",
    type: String,
    description: "Keyword to search",
    required: false
  })
  @Get()
  findAll(@Query('keyword') keyword?: string) {
    return this.lecteurService.findAll(keyword);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Lecteur })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lecteurService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Lecteur })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLecteurDto: UpdateLecteurDto) {
    return this.lecteurService.update(id, updateLecteurDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOkResponse({ type: Lecteur })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lecteurService.remove(id);
  }
}
