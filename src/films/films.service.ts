import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq, ilike, sql } from "drizzle-orm";

import { actors, actorsToFilms, films } from "@database/database.schema";
import { DrizzleService } from "@database/drizzle.service";

import { isDBError } from "@utils/database-utils";

import { CreateFilmDto } from "./dto/create-film.dto";
import { UpdateFilmDto } from "./dto/update-film.dto";

@Injectable()
export class FilmsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createFilmDto: CreateFilmDto) {
    const filmsQuery = this.drizzleService.db
      .insert(films)
      .values({
        title: sql.placeholder("title"),
        year: sql.placeholder("year"),
        director: sql.placeholder("director"),
        genre: sql.placeholder("genre"),
      })
      .returning()
      .prepare("create_film");

    const { actors, ...rest } = createFilmDto;

    const createdFilm = await filmsQuery.execute({ ...rest }).catch((err) => {
      if (isDBError(err) && err.code === "23505") {
        return new BadRequestException("Username already exists");
      }

      return new Error();
    });

    if (createdFilm instanceof Error) {
      throw createdFilm;
    }

    if (createdFilm.length > 0 && actors) {
      const actorsToFilmsQuery = this.drizzleService.db
        .insert(actorsToFilms)
        .values(
          actors.map((actorId) => ({
            actor_id: actorId,
            film_id: createdFilm[0].id,
          }))
        )
        .prepare("create_actors_to_films");

      await actorsToFilmsQuery.execute();
    }

    const filmWhitActors = await this.findOne(createdFilm[0].id);
    return filmWhitActors;
  }

  async findAll(keyword?: string) {
    const filmsQuery = !!keyword
      ? this.drizzleService.db.query.films
          .findMany({
            where: ilike(films.title, sql.placeholder("keyword")),
          })
          .prepare("find_all_films_by_keyword")
      : this.drizzleService.db.query.films.findMany().prepare("find_all_films");

    const allFilms = await filmsQuery.execute({ keyword: `%${keyword}%` });

    if (allFilms.length === 0) {
      throw new NotFoundException(
        `No films found ${keyword ? `for keyword "${keyword}"` : ""}`
      );
    }

    return allFilms;
  }

  async findOne(id: string) {
    const filmQuery = this.drizzleService.db.query.films
      .findFirst({
        where: eq(films.id, sql.placeholder("id")),
      })
      .prepare("find_film_by_id");

    const film = await filmQuery.execute({ id });

    if (!film) {
      throw new BadRequestException(`Film with id ${id} not found`);
    }

    const actorsToFilmsQuery = await this.drizzleService.db
      .select()
      .from(actorsToFilms)
      .leftJoin(actors, eq(actors.id, actorsToFilms.actor_id))
      .where(eq(actorsToFilms.film_id, film.id));

    const data = {
      ...film,
      actors: actorsToFilmsQuery.map((actor) => {
        return {
          id: actor.actors?.id,
          name: actor.actors?.name,
          born: actor.actors?.born,
          height: actor.actors?.height,
          photo: actor.actors?.photo,
          nationality: actor.actors?.nationality,
        };
      }),
    };
    return data;
  }

  async update(id: string, updateFilmDto: UpdateFilmDto) {
    const filmQuery = this.drizzleService.db
      .update(films)
      .set({
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        title: updateFilmDto.title ? sql.placeholder("title") : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        year: updateFilmDto.year ? sql.placeholder("year") : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        director: updateFilmDto.director
          ? sql.placeholder("director")
          : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        genre: updateFilmDto.genre ? sql.placeholder("genre") : undefined,
        updated_at: new Date(),
      })
      .where(eq(films.id, sql.placeholder("id")))
      .returning()
      .prepare("update_film");

    const { actors, ...rest } = updateFilmDto;
    const updatedFilm = await filmQuery.execute({ id, ...rest });

    if (updatedFilm.length > 0 && actors) {
      const actorsToFilmsQuery = this.drizzleService.db
        .insert(actorsToFilms)
        .values(
          actors.map((actorId) => ({
            actor_id: actorId,
            film_id: updatedFilm[0].id,
          }))
        )
        .prepare("create_actors_to_films");

      await actorsToFilmsQuery.execute();
    }

    if (updatedFilm.length === 0) {
      throw new BadRequestException(`Film with id ${id} not found`);
    }

    const filmWhitActors = await this.findOne(updatedFilm[0].id);
    return filmWhitActors;

  }

  async remove(id: string) {
    const filmQuery = this.drizzleService.db
      .delete(films)
      .where(eq(films.id, sql.placeholder("id")))
      .returning()
      .prepare("delete_film");

    const deletedFilm = await filmQuery.execute({ id });

    if (deletedFilm.length === 0) {
      throw new BadRequestException(`Film with id ${id} not found`);
    }

    return deletedFilm[0];
  }
}
