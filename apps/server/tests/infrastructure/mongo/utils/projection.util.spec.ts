import { ProjectionDto } from '@/application/dtos/projection.dto';
import { parseMongoProjection } from '@/infrastructure/mongo/utils/projection.util';

describe('parseMongoProjection', () => {
  it('should parse simple fields and map domain properties to db persistence names', () => {
    const projection = new ProjectionDto();
    projection.fields = {
      id: {},
      name: {},
      userId: {},
      verificationType: {},
      isVerified: {},
      invalidField: {}, // should be ignored as not allowed
    };

    const result = parseMongoProjection(projection, {
      allowedFields: ['id', 'name', 'userId', 'verificationType', 'isVerified'],
      fieldMap: {
        userId: 'user_id',
        verificationType: 'verification_type',
        isVerified: 'is_verified',
      },
    });

    expect(result.select).toBe('_id name user_id verification_type is_verified');
    expect(result.populate).toEqual([]);
  });

  it('should parse nested fields maps and support recursive population with select fields', () => {
    const projection = new ProjectionDto();
    projection.fields = {
      name: {},
      user: {
        email: {},
        fullName: {},
        role: {
          name: {},
        },
      },
    };

    const result = parseMongoProjection(projection, {
      allowedFields: ['name'],
      populate: {
        user: {
          path: 'user_id',
          select: ['email', 'fullName', 'role'],
          fieldMap: {
            fullName: 'full_name',
          },
          populate: {
            role: {
              path: 'role_id',
              select: ['name'],
            },
          },
        },
      },
    });

    expect(result.select).toBe('name');
    expect(result.populate).toEqual([
      {
        path: 'user_id',
        select: 'email full_name role',
        populate: [
          {
            path: 'role_id',
            select: 'name',
          },
        ],
      },
    ]);
  });
});
