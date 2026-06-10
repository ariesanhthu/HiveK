import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserType } from './user.type';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class EnterpriseType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field(() => UserType, { nullable: true })
  user?: any;

  @Field()
  companyName: string;

  @Field()
  description: string;

  @Field()
  contactEmail: string;

  @Field()
  contactPhone: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  logoUrlId?: string;

  @Field(() => UploadedFileType, { nullable: true })
  logoUrl?: any;

  @Field()
  isVerified: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
