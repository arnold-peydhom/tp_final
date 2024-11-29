import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq, ilike, sql } from "drizzle-orm";

import { lecteur, lecteurToLivre, livre } from "@database/database.schema";
import { DrizzleService } from "@database/drizzle.service";

import { isDBError } from "@utils/database-utils";

import { CreateLivreDto } from "./dto/create-livre.dto";
import { UpdateLivreDto } from "./dto/update-livre.dto";

@Injectable()
export class livreService {
  constructor(private readonly drizzleService: DrizzleService) { }

  async create(createLivreDto: CreateLivreDto) {
    const livreQuery = this.drizzleService.db
      .insert(livre)
      .values({
        title: sql.placeholder("title"),
        year: sql.placeholder("year"),
        director: sql.placeholder("director"),
        genre: sql.placeholder("genre"),
      })
      .returning()
      .prepare("create_livre");

    const { lecteur, ...rest } = createLivreDto;

    const createdFilm = await livreQuery.execute({ ...rest }).catch((err) => {
      if (isDBError(err) && err.code === "23505") {
        return new BadRequestException("Username already exists");
      }

      return new Error();
    });

    if (createdFilm instanceof Error) {
      throw createdFilm;
    }

    if (createdFilm.length > 0 && lecteur) {
      const lecteurToLivreQuery = this.drizzleService.db
        .insert(lecteurToLivre)
        .values(
          lecteur.map((lecteurId) => ({
            livre: lecteurId,
            lecteur_id: createdFilm[0].id,
          }))
        )
        .prepare("create_lecteur_to_livre");

      await lecteurToLivreQuery.execute();
    }

    const livreWhitLecteur = await this.findOne(createdFilm[0].id);
    return livreWhitLecteur;
  }

  async findAll(keyword?: string) {
    const livreQuery = !!keyword
      ? this.drizzleService.db.query.livre
        .findMany({
          where: ilike(livre.title, sql.placeholder("keyword")),
        })
        .prepare("find_all_livre_by_keyword")
      : this.drizzleService.db.query.livre.findMany().prepare("find_all_livre");

    const allLivre = await livreQuery.execute({ keyword: `%${keyword}%` });

    if (allLivre.length === 0) {
      throw new NotFoundException(
        `No livre found ${keyword ? `for keyword "${keyword}"` : ""}`
      );
    }

    return allLivre;
  }

  async findOne(id: string) {
    const livreQuery = this.drizzleService.db.query.livre
      .findFirst({
        where: eq(lecteur.id, sql.placeholder("id")),
      })
      .prepare("find_film_by_id");

    const livre = await livreQuery.execute({ id });

    if (!livre) {
      throw new BadRequestException(`Film with id ${id} not found`);
    }

    const actorsToFilmsQuery = await this.drizzleService.db
      .select()
      .from(lecteurToLivre)
      .leftJoin(lecteur, eq(lecteur.id, lecteurToLivre.lecteur_id))
      .where(eq(lecteurToLivre.lecteur_id, livre.id));

    const data = {
      ...livre,
      lecteur: actorsToFilmsQuery.map((lecteur) => {
        return {
          id: lecteur.lecteur?.id,
          name: lecteur.lecteur?.name,
          born: lecteur.lecteur?.born,
          height: lecteur.lecteur?.height,
          photo: lecteur.lecteur?.photo,
          nationality: lecteur.lecteur?.nationality,
        };
      }),
    };
    return data;
  }

  async update(id: string, updateLivreDto: UpdateLivreDto) {
    const livreQuery = this.drizzleService.db
      .update(livre)
      .set({
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        title: updateLivreDto.title ? sql.placeholder("title") : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        year: updateLivreDto.year ? sql.placeholder("year") : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        director: updateLivreDto.director
          ? sql.placeholder("director")
          : undefined,
        // @ts-expect-error TS bug see : https://github.com/drizzle-team/drizzle-orm/pull/1666
        genre: updateLivreDto.genre ? sql.placeholder("genre") : undefined,
        updated_at: new Date(),
      })
      .where(eq(livre.id, sql.placeholder("id")))
      .returning()
      .prepare("update_livre");

    const { lecteur, ...rest } = updateLivreDto;
    const updatedLivre = await livreQuery.execute({ id, ...rest });

    if (updatedLivre.length > 0 && lecteur) {
      const actorsToFilmsQuery = this.drizzleService.db
        .insert(lecteurToLivre)
        .values(
          lecteur.map((lecteurId) => ({
            lecteur_id: lecteurId,
            livre_id: updatedLivre[0].id,
          }))
        )
        .prepare("create_actors_to_films");

      await lecteurToLivreQuery.execute();
    }

    if (updatedLivre.length === 0) {
      throw new BadRequestException(`livre with id ${id} not found`);
    }

    const lecteurToLivre = await this.findOne(updatedLivre[0].id);
    return lecteurToLivre;

  }

  async remove(id: string) {
    const livreQuery = this.drizzleService.db
      .delete(livre)
      .where(eq(livre.id, sql.placeholder("id")))
      .returning()
      .prepare("delete_livre");

    const deletedLivre = await livreQuery.execute({ id });

    if (deletedLivre.length === 0) {
      throw new BadRequestException(`Livre with id ${id} not found`);
    }

    return deletedLivre[0];
  }
}
