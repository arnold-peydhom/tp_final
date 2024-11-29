import { z } from "zod";

export const createLecteurSchema = z.object({
    name: z.string().min(1),
    born: z.string().optional(),
    height: z.number().optional(),
    nationality: z.string().optional(),
    photo: z.string().optional(),
});

export type CreateLecteurSchema = z.infer<typeof createLecteurSchema>;

export class CreateLecteurDto implements CreateLecteurSchema {
    name: string;
    born?: string;
    height?: number;
    nationality?: string;
    photo?: string;
}
