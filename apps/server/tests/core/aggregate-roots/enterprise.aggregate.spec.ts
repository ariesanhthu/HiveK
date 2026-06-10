import { EnterpriseRoot } from '@core/aggregate-roots/enterprise.aggregate';

describe('EnterpriseRoot', () => {
  const props = {
    userId: 'user-123',
    companyName: 'ACME Corp',
    description: 'A cool company',
    contactEmail: 'contact@acme.com',
    contactPhone: '987654321',
    website: 'https://acme.com',
    taxId: 'TAX-001',
    logoUrlId: 'logo-123',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create and get properties correctly', () => {
    const root = EnterpriseRoot.create(props);

    expect(root).toBeDefined();
    expect(root.userId).toBe(props.userId);
    expect(root.companyName).toBe(props.companyName);
    expect(root.description).toBe(props.description);
    expect(root.contactEmail).toBe(props.contactEmail);
    expect(root.contactPhone).toBe(props.contactPhone);
    expect(root.website).toBe(props.website);
    expect(root.taxId).toBe(props.taxId);
    expect(root.logoUrlId).toBe(props.logoUrlId);
    expect(root.isVerified).toBe(props.isVerified);
  });

  it('should instantiate EnterpriseRoot with id', () => {
    const root = EnterpriseRoot.instantiate('enterprise-id-123', props);

    expect(root).toBeDefined();
    expect(root.id).toBe('enterprise-id-123');
  });
});
