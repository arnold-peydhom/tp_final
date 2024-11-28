import { z } from "zod";

export const createActorSchema = z.object({
    name: z.string().min(1),
    born: z.string().optional(),
    height: z.number().optional(),
    nationality: z.string().optional(),
    photo: z.string().optional(),
});

export type CreateActorSchema = z.infer<typeof createActorSchema>;

export class CreateActorDto implements CreateActorSchema {
    name: string;
    born?: string;
    height?: number;
    nationality?: string;
    photo?: string;
}
