import { z } from "zod"

export const createFilSchema = z.object({
    title: z.string().min(1),
    year: z.string().min(1),
    director: z.string().min(1),
    genre: z.string().min(1),
    actors: z.array(z.string()).optional(),
})

export type CreateFilmSchema = z.infer<typeof createFilSchema>

export class CreateFilmDto implements CreateFilmSchema {
    title: string
    year: string
    director: string
    genre: string
    actors?: string[]
}
