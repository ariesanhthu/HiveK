export class UserAddedToEnterpriseEvent {
  constructor(
    public readonly userId: string,
    public readonly enterpriseId: string,
  ) {}
}
