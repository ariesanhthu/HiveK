import { createZodDto } from 'nestjs-zod';
import { UserCreateInputSchema } from '../user-create/user-create.dto';

export const UserUpdateInputSchema = UserCreateInputSchema.partial();

export class UserUpdateInputDto extends createZodDto(UserUpdateInputSchema) {}
