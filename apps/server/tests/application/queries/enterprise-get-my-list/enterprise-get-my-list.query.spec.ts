import { EnterpriseGetMyListQuery } from '@/application/queries/enterprise-get-my-list/enterprise-get-my-list.query';

describe('EnterpriseGetMyListQuery', () => {
  it('should create a query with userId and filters', () => {
    const filters = { limit: 10 };
    const query = new EnterpriseGetMyListQuery('user-123', filters);

    expect(query.userId).toBe('user-123');
    expect(query.filters).toEqual(filters);
  });

  it('should create a query with userId and no filters', () => {
    const query = new EnterpriseGetMyListQuery('user-123');

    expect(query.userId).toBe('user-123');
    expect(query.filters).toBeUndefined();
  });
});