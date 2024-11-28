import { z } from "zod";

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
});

export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>;

export class UpdateReviewDto implements UpdateReviewSchema {
  rating?: number;
  comment?: string;
}
