import { z } from "zod";

export const createReviewSchema = z.object({
  filmId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;

export class CreateReviewDto implements CreateReviewSchema {
  filmId: string;
  rating: number;
  comment: string;
}
