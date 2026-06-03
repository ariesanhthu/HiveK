export class KolProfileVerifyPlatformAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly platformId: string,
    public readonly externalId: string,
    public readonly uniqueId: string,
    public readonly displayName: string,
    public readonly email: string,
  ) {}
}
