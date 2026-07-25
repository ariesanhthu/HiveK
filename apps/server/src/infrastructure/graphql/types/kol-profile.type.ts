import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import type { JsonObject } from '@/core/types/common.type';
import { UserType } from './user.type';
import { PlatformType } from './platform.type';

@ObjectType()
export class KolPlatformInfoType {
  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: PlatformType | null;

  @Field()
  uniqueId: string;

  @Field({ nullable: true })
  externalId?: string;

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
export class KolProfileType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  verificationType?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => [KolPlatformInfoType])
  platforms: KolPlatformInfoType[];

  @Field()
  isVerified: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true })
  scores?: JsonObject | null;

  @Field(() => UserType, { nullable: true })
  user?: UserType | null;
}
