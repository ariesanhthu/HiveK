import { Field, ObjectType, ID } from '@nestjs/graphql';
import { RoleType } from './role.type';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  fullName: string;

  @Field(() => UploadedFileType, { nullable: true })
  avatar?: UploadedFileType | null;

  @Field()
  roleId: string;

  @Field(() => RoleType, { nullable: true })
  role?: RoleType | null;

  @Field()
  isEmailVerified: boolean;

  @Field()
  type: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
