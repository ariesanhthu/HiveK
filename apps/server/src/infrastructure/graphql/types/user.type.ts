import { Field, ID, ObjectType } from '@nestjs/graphql';
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
  avatar?: any;

  @Field()
  roleId: string;

  @Field(() => RoleType, { nullable: true })
  role?: any;

  @Field()
  isEmailVerified: boolean;

  @Field()
  type: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
