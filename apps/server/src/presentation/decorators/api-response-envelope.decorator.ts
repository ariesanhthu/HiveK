import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Wraps a DTO class into the standard ApiResponse envelope shape for Swagger docs.
 */
export const ApiOkResponseEnvelope = <TModel extends Type<unknown>>(
  model?: TModel,
  status: HttpStatus = HttpStatus.OK,
) => {
  if (!model) {
    return ApiResponse({
      status,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', nullable: true, example: null },
          error: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', nullable: true, example: null },
        },
      },
    });
  }

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: getSchemaPath(model) },
          error: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', nullable: true, example: null },
        },
      },
    }),
  );
};

/**
 * Wraps an array of DTO models into the standard Paginated Response envelope shape for Swagger docs.
 */
export const ApiPaginatedResponseEnvelope = <TModel extends Type<unknown>>(
  model: TModel,
  status: HttpStatus = HttpStatus.OK,
) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          error: { type: 'object', nullable: true, example: null },
          meta: {
            type: 'object',
            properties: {
              cursor: { type: 'string', nullable: true, example: '60a7f1...' },
              has_next: { type: 'boolean', example: true },
              limit: { type: 'number', example: 10 },
            },
          },
        },
      },
    }),
  );
};
