import { PartialType } from '@nestjs/swagger';

import { CreateLecteurDto } from './create-lecteur.dto';

export class UpdateLecteurDto extends PartialType(CreateLecteurDto) { }
