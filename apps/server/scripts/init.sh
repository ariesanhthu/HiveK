#!/usr/bin/env bash

# Scaffolding script
# Usage: ./init.sh <domain|command|query|vo|enum> <Name>

set -e

if [ -z "$2" ] || { [ "$1" != "domain" ] && [ "$1" != "command" ] && [ "$1" != "query" ] && [ "$1" != "vo" ] && [ "$1" != "enum" ]; }; then
  echo "Usage: $0 <domain|command|query|vo|enum> <Name>"
  exit 1
fi

DOMAIN_NAME="$2"

# Helper functions to convert naming styles
to_kebab() {
  echo "$1" | sed -E 's/([a-z0-9])([A-Z])/-\1-\2/g' | tr '[:upper:]' '[:lower:]'
}
to_upper_snake() {
  echo "$1" | sed -E 's/([a-z0-9])([A-Z])/_\1_\2/g' | tr '[:lower:]' '[:upper:]'
}

KABAB=$(to_kebab "$DOMAIN_NAME")
UPPER=$(to_upper_snake "$DOMAIN_NAME")
# Class name in PascalCase (e.g., abc-xyz -> AbcXyz)
to_pascal() {
  # Replace hyphens/underscores and capitalize following letter, then remove them
  echo "$1" | sed -E 's/(^|[-_])([a-z])/\U\2/g' | tr -d -- '-_'
}
CLASS_NAME=$(to_pascal "$DOMAIN_NAME")

# Determine the project root relative to this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/../src"

if [ "$1" = "domain" ]; then
# ------------------------------------------------------------
# 1. Core aggregate root
AGG_PATH="$ROOT/core/aggregate-roots/${KABAB}.aggregate.ts"
mkdir -p "$(dirname "$AGG_PATH")"
if [ -e "$AGG_PATH" ]; then
  echo "Aggregate already exists: $AGG_PATH"
else
  cat > "$AGG_PATH" <<EOF
import { BaseAggregateRoot } from '@core/common/base.aggregate-root';

export interface ${CLASS_NAME}Props {
  createdAt: Date;
  updatedAt: Date;
}

export type ${CLASS_NAME}CreateProps = Omit<${CLASS_NAME}Props, 'createdAt' | 'updatedAt'>;

export class ${CLASS_NAME}Root extends BaseAggregateRoot<${CLASS_NAME}Props> {
  private constructor(props: ${CLASS_NAME}Props, id?: string) {
    super(props, id);
  }

  public static create(props: ${CLASS_NAME}CreateProps): ${CLASS_NAME}Root {
    const now = new Date();
    return new ${CLASS_NAME}Root({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static instantiate(id: string, props: ${CLASS_NAME}Props): ${CLASS_NAME}Root {
    return new ${CLASS_NAME}Root(props, id);
  }

}
EOF
  echo "Created aggregate: $AGG_PATH"
fi

# Update aggregate index
AGG_INDEX="$ROOT/core/aggregate-roots/index.ts"
if ! grep -q "export \* from './${KABAB}.aggregate';" "$AGG_INDEX"; then
  echo "export * from './${KABAB}.aggregate';" >> "$AGG_INDEX"
  echo "Updated aggregate index"
fi

# ------------------------------------------------------------
# 2. Repository interface & DI token
REPO_IF_PATH="$ROOT/core/interfaces/repositories/${KABAB}.repository.ts"
mkdir -p "$(dirname "$REPO_IF_PATH")"
if [ -e "$REPO_IF_PATH" ]; then
  echo "Repository interface already exists: $REPO_IF_PATH"
else
  cat > "$REPO_IF_PATH" <<EOF
import { IBaseRepository } from '@core/common/base.repository.interface';
import { ${CLASS_NAME}Root } from '@core/aggregate-roots/${KABAB}.aggregate';

export interface I${CLASS_NAME}Repository extends IBaseRepository<${CLASS_NAME}Root> {
  // TODO: define CRUD methods
}

export const ${UPPER}_REPOSITORY = Symbol('${CLASS_NAME}_REPOSITORY');
EOF
  echo "Created repository interface: $REPO_IF_PATH"
fi

# Update repository index if present
REPO_INDEX="$ROOT/core/interfaces/repositories/index.ts"
if [ -f "$REPO_INDEX" ]; then
  if ! grep -q "export \* from './${KABAB}.repository';" "$REPO_INDEX"; then
    echo "export * from './${KABAB}.repository';" >> "$REPO_INDEX"
    echo "Updated repository index"
  fi
fi

# ------------------------------------------------------------
# 3. Mongoose schema
SCHEMA_PATH="$ROOT/infrastructure/mongo/schemas/${KABAB}.schema.ts"
mkdir -p "$(dirname "$SCHEMA_PATH")"
if [ -e "$SCHEMA_PATH" ]; then
  echo "Schema already exists: $SCHEMA_PATH"
else
  cat > "$SCHEMA_PATH" <<EOF
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: '${KABAB}s',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ${CLASS_NAME}Model {

  created_at: Date;
  updated_at: Date;
}

export type ${CLASS_NAME}Document = HydratedDocument<${CLASS_NAME}Model>;
export const ${CLASS_NAME}Schema = SchemaFactory.createForClass(${CLASS_NAME}Model);

EOF
  echo "Created schema: $SCHEMA_PATH"
fi

# Update schema index if present
SCHEMA_INDEX="$ROOT/infrastructure/mongo/schemas/index.ts"
if [ -f "$SCHEMA_INDEX" ]; then
  if ! grep -q "export \* from './${KABAB}.schema';" "$SCHEMA_INDEX"; then
    echo "export * from './${KABAB}.schema';" >> "$SCHEMA_INDEX"
    echo "Updated schema index"
  fi
fi

# ------------------------------------------------------------
# 4. Repository implementation placeholder
REPO_IMPL_PATH="$ROOT/infrastructure/mongo/repositories/${KABAB}.repository.ts"
mkdir -p "$(dirname "$REPO_IMPL_PATH")"
if [ -e "$REPO_IMPL_PATH" ]; then
  echo "Repository implementation already exists: $REPO_IMPL_PATH"
else
  cat > "$REPO_IMPL_PATH" <<EOF
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { I${CLASS_NAME}Repository } from '@/core/interfaces/repositories';
import { ${CLASS_NAME}Root } from '@/core/aggregate-roots';
import { ${CLASS_NAME}Model, ${CLASS_NAME}Document } from '../schemas';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class Mongo${CLASS_NAME}Repository implements I${CLASS_NAME}Repository {
  constructor(
    @InjectModel(${CLASS_NAME}Model.name)
    private readonly ${KABAB}Model: Model<${CLASS_NAME}Document>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  // TODO: implement repository methods (e.g., findById, save, delete)

  private mapToDomain(doc: ${CLASS_NAME}Document): ${CLASS_NAME}Root {
    if (!doc._id) {
      throw new Error('${CLASS_NAME} document ID is missing');
    }
    return ${CLASS_NAME}Root.instantiate(doc._id.toString(), {
    });
  }

  private mapToPersistence(${KABAB}: ${CLASS_NAME}Root): Omit<${CLASS_NAME}Model, 'created_at' | 'updated_at'> {
    return {

    };
  }
}

EOF
  echo "Created repository implementation: $REPO_IMPL_PATH"
fi

# Update mongo repository index if present
REPO_IMPL_INDEX="$ROOT/infrastructure/mongo/repositories/index.ts"
if [ -f "$REPO_IMPL_INDEX" ]; then
  if ! grep -q "export \* from './${KABAB}.repository';" "$REPO_IMPL_INDEX"; then
    echo "export * from './${KABAB}.repository';" >> "$REPO_IMPL_INDEX"
    echo "Updated mongo repository index"
  fi
fi

# ------------------------------------------------------------
# 5. Infrastructure module for the domain
MODULE_PATH="$ROOT/infrastructure/modules/${KABAB}.module.ts"
mkdir -p "$(dirname "$MODULE_PATH")"
if [ -e "$MODULE_PATH" ]; then
  echo "Infrastructure module already exists: $MODULE_PATH"
else
  cat > "$MODULE_PATH" <<EOF
import { Module } from '@nestjs/common';
import { Mongo${CLASS_NAME}Repository } from '../mongo/repositories/${KABAB}.repository';
import { ${UPPER}_REPOSITORY } from '@/core/interfaces/repositories/${KABAB}.repository';
import { ${CLASS_NAME}Controller } from '@/presentation/controllers';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [${CLASS_NAME}Controller],
  providers: [{ provide: ${UPPER}_REPOSITORY, useClass: Mongo${CLASS_NAME}Repository }],
  exports: [${UPPER}_REPOSITORY],
})
export class ${CLASS_NAME}Module {}
EOF
  echo "Created infrastructure module: $MODULE_PATH"
fi

# Register the new module in the root infrastructure module
INF_ROOT_MODULE="$ROOT/infrastructure/infrastructure.module.ts"
if [ -f "$INF_ROOT_MODULE" ]; then
  if ! grep -q "${DOMAIN_NAME}Module" "$INF_ROOT_MODULE"; then
    # add import at top
    sed -i "1i\import { ${DOMAIN_NAME}Module } from './modules/${KABAB}.module';" "$INF_ROOT_MODULE"
    # add to imports array (simple heuristic)
    sed -i "/imports: \[/a\    ${DOMAIN_NAME}Module," "$INF_ROOT_MODULE"
    echo "Registered ${DOMAIN_NAME}Module in infrastructure root module"
  fi
fi

# ------------------------------------------------------------
# 6. Presentation controller
CTRL_PATH="$ROOT/presentation/controllers/${KABAB}.controller.ts"
mkdir -p "$(dirname "$CTRL_PATH")"
if [ -e "$CTRL_PATH" ]; then
  echo "Controller already exists: $CTRL_PATH"
else
  cat > "$CTRL_PATH" <<EOF
import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';

@ApiTags('${KABAB}s')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller('${KABAB}s')
export class ${CLASS_NAME}Controller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }
  
  @Post()
  async create(@Body() dto: any) {
    // TODO: dispatch appropriate command
    return this.commandBus.execute({});
  }

  @Get()
  async findAll() {
    // TODO: dispatch appropriate query
    return this.queryBus.execute({});
  }
}
EOF
  echo "Created controller: $CTRL_PATH"
fi

# Update presentation controller index if exists
CTRL_INDEX="$ROOT/presentation/controllers/index.ts"
if [ -f "$CTRL_INDEX" ]; then
  if ! grep -q "export \* from './${KABAB}.controller';" "$CTRL_INDEX"; then
    echo "export * from './${KABAB}.controller';" >> "$CTRL_INDEX"
    echo "Updated controller index"
  fi
fi
fi

if [ "$1" = "command" ]; then
  CMD_PATH="$ROOT/application/commands/${KABAB}"
  mkdir -p "$CMD_PATH"
  cat > "${CMD_PATH}/${KABAB}.dto.ts" <<EOF
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ${CLASS_NAME}Schema = z.object({
  // TODO: define input fields
}).strict();

export class ${CLASS_NAME}Dto extends createZodDto(${CLASS_NAME}Schema) {}
EOF
  cat > "${CMD_PATH}/${KABAB}.command.ts" <<EOF
import { Command } from '@nestjs/cqrs';
import { ${CLASS_NAME}Dto } from './${KABAB}.dto';

export class ${CLASS_NAME}Command extends Command<any> {
  constructor(public readonly input: ${CLASS_NAME}Dto) {
    super();
  }
}
EOF
  cat > "${CMD_PATH}/${KABAB}.handler.ts" <<EOF
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { ${CLASS_NAME}Command } from './${KABAB}.command';

@CommandHandler(${CLASS_NAME}Command)
export class ${CLASS_NAME}CommandHandler implements ICommandHandler<${CLASS_NAME}Command, any> {
  async execute(command: ${CLASS_NAME}Command): Promise<any> {
    // TODO: implement command handling
    return {};
  }
}
EOF
  CMD_INDEX="$ROOT/application/commands/index.ts"
  if [ -f "$CMD_INDEX" ]; then
    for file in dto command handler; do
      if ! grep -q "export \* from './${KABAB}/${KABAB}.${file}';" "$CMD_INDEX"; then
        echo "export * from './${KABAB}/${KABAB}.${file}';" >> "$CMD_INDEX"
      fi
    done
  fi
  echo "Scaffolding for ${DOMAIN_NAME} (${1}) completed."
  exit 0
fi

if [ "$1" = "query" ]; then
  QUERY_PATH="$ROOT/application/queries/${KABAB}"
  mkdir -p "$QUERY_PATH"
  cat > "${QUERY_PATH}/${KABAB}.dto.ts" <<EOF
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ${CLASS_NAME}Schema = z.object({
  // TODO: define input fields
}).strict();

export class ${CLASS_NAME}Dto extends createZodDto(${CLASS_NAME}Schema) {}
EOF
  cat > "${QUERY_PATH}/${KABAB}.query.ts" <<EOF
import { Query } from '@nestjs/cqrs';
import { ${CLASS_NAME}Dto } from './${KABAB}.dto';

export class ${CLASS_NAME}Query extends Query<any> {
  constructor(public readonly input: ${CLASS_NAME}Dto) {
    super();
  }
}
EOF
  cat > "${QUERY_PATH}/${KABAB}.handler.ts" <<EOF
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ${CLASS_NAME}Query } from './${KABAB}.query';

@QueryHandler(${CLASS_NAME}Query)
export class ${CLASS_NAME}QueryHandler implements IQueryHandler<${CLASS_NAME}Query, any> {
  async execute(query: ${CLASS_NAME}Query): Promise<any> {
    // TODO: implement query handling
    return {};
  }
}
EOF
  QUERY_INDEX="$ROOT/application/queries/index.ts"
  if [ -f "$QUERY_INDEX" ]; then
    for file in dto query handler; do
      if ! grep -q "export \* from './${KABAB}/${KABAB}.${file}';" "$QUERY_INDEX"; then
        echo "export * from './${KABAB}/${KABAB}.${file}';" >> "$QUERY_INDEX"
      fi
    done
  fi
  echo "Scaffolding for ${DOMAIN_NAME} (${1}) completed."
  exit 0
fi

if [ "$1" = "vo" ]; then
  VO_DIR="$ROOT/core/value-objects"
  VO_PATH="$VO_DIR/${KABAB}.value-object.ts"
  mkdir -p "$VO_DIR"
  if [ -e "$VO_PATH" ]; then
    echo "Value object already exists: $VO_PATH"
  else
    cat > "$VO_PATH" <<EOF
import { BaseValueObject } from '@core/common/base.value-object';

export interface ${CLASS_NAME}Props {
  value: string;
}

export class ${CLASS_NAME}VO extends BaseValueObject<${CLASS_NAME}Props> {
  private constructor(props: ${CLASS_NAME}Props) {
    super(props);
  }

  public static create(props: ${CLASS_NAME}Props): ${CLASS_NAME}VO {
    return new ${CLASS_NAME}VO(props);
  }

  get value(): string {
    return this.props.value;
  }
}
EOF
    echo "Created value object: $VO_PATH"
  fi

  VO_INDEX="$ROOT/core/value-objects/index.ts"
  if [ -f "$VO_INDEX" ]; then
    if ! grep -q "export \* from './${KABAB}.value-object';" "$VO_INDEX"; then
      echo "export * from './${KABAB}.value-object';" >> "$VO_INDEX"
      echo "Updated value object index"
    fi
  else
    cat > "$VO_INDEX" <<EOF
export * from './${KABAB}.value-object';
EOF
    echo "Created value object index"
  fi

  echo "Scaffolding for ${DOMAIN_NAME} (${1}) completed."
  exit 0
fi

if [ "$1" = "enum" ]; then
  ENUM_DIR="$ROOT/core/enums"
  ENUM_PATH="$ENUM_DIR/${KABAB}.enum.ts"
  mkdir -p "$ENUM_DIR"
  if [ -e "$ENUM_PATH" ]; then
    echo "Enum already exists: $ENUM_PATH"
  else
    cat > "$ENUM_PATH" <<EOF
export enum ${CLASS_NAME} {
}
EOF
    echo "Created enum: $ENUM_PATH"
  fi

  ENUM_INDEX="$ROOT/core/enums/index.ts"
  if [ -f "$ENUM_INDEX" ]; then
    if ! grep -q "export \* from './${KABAB}.enum';" "$ENUM_INDEX"; then
      echo "export * from './${KABAB}.enum';" >> "$ENUM_INDEX"
      echo "Updated enum index"
    fi
  fi

  echo "Scaffolding for ${DOMAIN_NAME} (${1}) completed."
  exit 0
fi

echo "Domain scaffolding for ${DOMAIN_NAME} completed."
