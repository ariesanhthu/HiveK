import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class KolPlatformInfoType {
  @Field()
  platformId: string;

  @Field()
  uniqueId: string;

  @Field()
  externalId: string;

  @Field(() => Int)
  followerCount: number;

  @Field(() => Float)
  avgEngagement: number;

  @Field(() => [String])
  topTags: string[];

  @Field(() => [String])
  categories: string[];
}

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

  @Field()
  roleId: string;

  @Field()
  isEmailVerified: boolean;

  @Field()
  type: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

@ObjectType()
export class KolProfileType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  verificationType?: string;

  @Field()
  name: string;

  @Field()
  location: string;

  @Field()
  gender: string;

  @Field()
  bio: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => [KolPlatformInfoType])
  platforms: KolPlatformInfoType[];

  @Field()
  isVerified: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  scores?: Record<string, any>;

  @Field(() => UserType, { nullable: true })
  user?: any;
}
