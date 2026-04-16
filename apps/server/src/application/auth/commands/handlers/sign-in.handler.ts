import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignInCommand } from '../sign-in.command';
import { SignInOutputDto } from '../../dtos';
import { Inject } from '@nestjs/common';
import { AUTH_JWT_SERVICE, type IAuthJwtService } from '@/application/interfaces';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces';
import * as bcrypt from 'bcrypt';

@CommandHandler(SignInCommand)
export class SignInCommandHandler implements ICommandHandler<SignInCommand, SignInOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(AUTH_JWT_SERVICE)
    private readonly jwtService: IAuthJwtService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInOutputDto> {
    const { input } = command;

    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.roleId, // Using roleId as role in payload for now
    });

    return { accessToken };
  }
}
