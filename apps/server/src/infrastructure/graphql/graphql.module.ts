import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: '/hivek/graphql',
      driver: ApolloDriver,
      autoSchemaFile: join(
        process.cwd(),
        'src/infrastructure/graphql/schema.gql',
      ),
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
  ],
  providers: [],
  exports: [],
})
export class GraphqlModule {}
