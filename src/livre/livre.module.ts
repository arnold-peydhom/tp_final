import { Module } from '@nestjs/common';

import { LivreController } from './livre.controller'; 
import { livreService } from './livre.service';

@Module({
  controllers: [LivreController],
  providers: [livreService],
  exports: [LivreModule],
})
export class LivreModule { }
