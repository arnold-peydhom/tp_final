import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, ilike, sql } from 'drizzle-orm';

import { actors } from '@database/database.schema';
import { DrizzleService } from '@database/drizzle.service';

import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

@Injectable()
export class ActorsService {
  constructor(private readonly drizzleService: DrizzleService) {}
  
  async create(createActorDto: CreateActorDto) {
    const actor = this.drizzleService.db
      .insert(actors)
      .values(createActorDto)
      .returning()
      .prepare('create_actor');
    
    const createdActor = await actor.execute();
    return createdActor[0];
  }

  async findAll(keyword?: string) {
    const actorsQuery = !!keyword ?  
    this.drizzleService.db.query.actors
      .findMany({
        where: ilike(actors.name, sql.placeholder('keyword')),
      })
      .prepare('find_all_actors') 
    : 
    this.drizzleService.db.query.actors
      .findMany()
      .prepare('find_all_actors');

    const allActors = await actorsQuery.execute({ keyword: `%${keyword}%` });

    if (allActors.length === 0) {
      throw new NotFoundException(`No actors found ${keyword ? `for keyword ${keyword}` : ''}`);
    }
    
    return allActors;
  }

  async findOne(id: string) {
    const actorQuery = this.drizzleService.db.query.actors
      .findFirst({
        where: eq(actors.id, sql.placeholder('id')),
      })
      .prepare('find_actor_by_id');

    const actor = await actorQuery.execute({ id });

    if (!actor) {
      throw new NotFoundException(`Actor with id ${id} not found`);
    }

    return actor;
  }

  async update(id: string, updateActorDto: UpdateActorDto) {
    const actorQuery = this.drizzleService.db
      .update(actors)
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
        photo: updateActorDto.photo ? sql.placeholder('photo') : undefined,
        updated_at: new Date(),
      })
      .where(eq(actors.id, sql.placeholder('id')))
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
      .delete(actors)
      .where(eq(actors.id, sql.placeholder('id')))
      .returning()
      .prepare('delete_actor');

    const deletedActor = await actorQuery.execute({ id });

    if (deletedActor.length === 0) {
      throw new NotFoundException(`Actor with id ${id} not found`);
    }

    return deletedActor[0];
  }
}
