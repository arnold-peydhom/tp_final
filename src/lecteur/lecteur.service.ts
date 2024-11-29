import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, ilike, sql } from 'drizzle-orm';

import { lecteur } from '@database/database.schema';
import { DrizzleService } from '@database/drizzle.service';

import { CreateLecteurDto } from './dto/create-lecteur.dto';
import { UpdateLecteurDto } from './dto/update-lecteur.dto';

@Injectable()
export class LecteurService {
  constructor(private readonly drizzleService: DrizzleService) { }

  async create(createLecteurDto: CreateLecteurDto) {
    const actor = this.drizzleService.db
      .insert(lecteur)
      .values(createLecteurDto)
      .returning()
      .prepare('create_lecteur');

    const createdActor = await actor.execute();
    return createdActor[0];
  }

  async findAll(keyword?: string) {
    const actorsQuery = !!keyword ?
      this.drizzleService.db.query.lecteur
        .findMany({
          where: ilike(lecteur.name, sql.placeholder('keyword')),
        })
        .prepare('find_all_lectors')
      :
      this.drizzleService.db.query.lecteur
        .findMany()
        .prepare('find_all_lectors');

    const allLectors = await actorsQuery.execute({ keyword: `%${keyword}%` });

    if (allLectors.length === 0) {
      throw new NotFoundException(`No Lectors found ${keyword ? `for keyword ${keyword}` : ''}`);
    }

    return allLectors;
  }

  async findOne(id: string) {
    const lecteurQuery = this.drizzleService.db.query.lecteur
      .findFirst({
        where: eq(lecteur.id, sql.placeholder('id')),
      })
      .prepare('find_actor_by_id');

    const lecteur = await lecteurQuery.execute({ id });

    if (!lecteur) {
      throw new NotFoundException(`lector with id ${id} not found`);
    }

    return lecteur;
  }

  async update(id: string, updateActorDto: UpdateLecteurDto) {
    const actorQuery = this.drizzleService.db
      .update(lecteur)
      .set({
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        name: updateActorDto.name ? sql.placeholder('name') : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        born: updateActorDto.born ? sql.placeholder('born') : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        height: updateActorDto.height ? sql.placeholder('height') : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        nationality: updateActorDto.nationality ? sql.placeholder('nationality') : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        photo: updateLecteurDto.photo ? sql.placeholder('photo') : undefined,
        updated_at: new Date(),
      })
      .where(eq(lecteur.id, sql.placeholder('id')))
      .returning()
      .prepare('update_actor');

    const updatedActor = await actorQuery.execute({ id, ...updateActorDto });

    if (updatedActor.length === 0) {
      throw new NotFoundException(`Actor with id ${id} not found`);
    }

    return updatedActor[0];
  }

  async remove(id: string) {
    const actorQuery = this.drizzleService.db
      .delete(lecteur)
      .where(eq(lecteur.id, sql.placeholder('id')))
      .returning()
      .prepare('delete_actor');

    const deletedActor = await actorQuery.execute({ id });

    if (deletedActor.length === 0) {
      throw new NotFoundException(`Actor with id ${id} not found`);
    }

    return deletedActor[0];
  }
}
