import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { reviews, users } from "@database/database.schema";
import { DrizzleService } from "@database/drizzle.service";

import { isDBError } from "@utils/database-utils";
import { JwtUser } from "@utils/types/auth-types";

import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { eq, sql } from "drizzle-orm/sql";

@Injectable()
export class ReviewsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createReviewDto: CreateReviewDto, user: JwtUser) {
    try {
      const reviewsQuery = this.drizzleService.db
        .insert(reviews)
        .values({
          film_id: sql.placeholder("filmId"),
          user_id: sql.placeholder("userId"),
          rating: sql.placeholder("rating"),
          comment: sql.placeholder("comment"),
        })
        .returning()
        .prepare("create_review");

      const createReviewPayload = {
        filmId: createReviewDto.filmId,
        userId: user.id,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      };

      const createdReview = await reviewsQuery.execute(createReviewPayload);

      if (!createdReview || createdReview.length === 0) {
        throw new Error("Failed to create the review.");
      }

      return createdReview[0];
    } catch (err) {
      if (isDBError(err)) {
        if (err.code === "23503") {
          throw new BadRequestException("Invalid film ID or user ID.");
        }
        if (err.code === "23505") {
          throw new BadRequestException(
            "Review already exists for this user and film."
          );
        }
      }
      throw new Error("An error occurred while creating the review.");
    }
  }

  async findAllByFilm(filmId: string) {
    try {
      const reviewsQuery = this.drizzleService.db
        .select()
        .from(reviews)
        .leftJoin(users, eq(reviews.user_id, users.id))
        .where(eq(reviews.film_id, sql.placeholder("filmId")))
        .prepare("find_all_reviews_by_film");

      const filmReviews = await reviewsQuery.execute({ filmId });

      return filmReviews.map((review) => ({
        ...review.reviews,
        user: {
          id: review.users?.id,
          username: review.users?.username,
        },
      }));
    } catch (err) {
      throw new Error("An error occurred while fetching reviews for the film.");
    }
  }

  async findAllByUser(userId: string) {
    try {
      const reviewsQuery = this.drizzleService.db
        .select()
        .from(reviews)
        .leftJoin(users, eq(reviews.user_id, userId))
        .where(eq(reviews.user_id, sql.placeholder("userId")))
        .prepare("find_all_reviews_by_user");

      const userReviews = await reviewsQuery.execute({ userId });

      return userReviews.map((review) => ({
        ...review.reviews,
        user: {
          id: review.users?.id,
          username: review.users?.username,
        },
      }));
    } catch (err) {
      throw new Error("An error occurred while fetching reviews for the user.");
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, user: JwtUser) {
    const review = await this.drizzleService.db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1)
      .execute();

    if (!review.length) {
      throw new NotFoundException(`Review with id ${id} not found.`);
    }

    if (review[0].user_id !== user.id) {
      throw new ForbiddenException(
        "You are not authorized to update this review."
      );
    }

    const updatedReview = await this.drizzleService.db
      .update(reviews)
      .set({
        rating: updateReviewDto.rating,
        comment: updateReviewDto.comment,
      })
      .where(eq(reviews.id, id))
      .returning()
      .execute();

    return updatedReview[0];
  }

  async remove(id: string, user: JwtUser) {
    const review = await this.drizzleService.db
      .select()
      .from(reviews)
      .where(eq(reviews.id, sql.placeholder("id")))
      .limit(1)
      .execute({ id });

    if (!review.length) {
      throw new NotFoundException(`Review with id ${id} not found.`);
    }

    if (review[0].user_id !== user.id) {
      throw new ForbiddenException(
        "You are not authorized to delete this review."
      );
    }

    const deletedReview = await this.drizzleService.db
      .delete(reviews)
      .where(eq(reviews.id, sql.placeholder("id")))
      .returning()
      .execute({ id });

    return deletedReview[0];
  }
}
