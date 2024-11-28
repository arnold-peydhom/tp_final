import { Module } from '@nestjs/common';

import { LecteurController } from './lecteur.controller';
import { LecteurService } from './lecteur.service';

@Module({
  controllers: [LecteurController],
  providers: [LecteurService],
  exports: [LecteurService],
})
export class LecteurModule { }
