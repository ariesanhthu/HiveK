import { ICommand } from '@nestjs/cqrs';

export class SocialPageRefreshTokenCommand implements ICommand {
  constructor(
    public readonly socialPageId: string,
    public readonly enterpriseId: string,
    public readonly userAccessToken: string,
  ) {}
}
