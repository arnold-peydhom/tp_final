import { z } from "zod"

export const createLivreSchema = z.object({
    title: z.string().min(1),
    year: z.string().min(1),
    director: z.string().min(1),
    genre: z.string().min(1),
    lecteur: z.array(z.string()).optional(),
})

export type CreateLivreSchema = z.infer<typeof createLivreSchema>

export class CreateLivreDto implements CreateLivreSchema {
    title: string
    year: string
    director: string
    genre: string
    lecteur?: string[]
}
