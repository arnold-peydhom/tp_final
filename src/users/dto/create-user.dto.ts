import { z } from 'zod';

import { passwordValidation } from './shared/user-validation';

export const createUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().regex(passwordValidation, {
    message:
      'Must contain at least 1 digit, 1 lowercase letter, 1 uppercase letter, 1 special character and be at least 8 characters long',
  }),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export class CreateUserDTO implements CreateUserSchema {
  username: string;
  password: string;
}
