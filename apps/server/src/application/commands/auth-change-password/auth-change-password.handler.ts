import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AuthChangePasswordCommand } from './auth-change-password.command';
import { AuthChangePasswordOutputDto } from './auth-change-password.dto';
import { USER_REPOSITORY, OTP_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { AuthService } from '@/application/services/auth.service';
import { UserNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { EOtpType } from '@/core/enums/otp-type.enum';

@CommandHandler(AuthChangePasswordCommand)
export class AuthChangePasswordCommandHandler implements ICommandHandler<AuthChangePasswordCommand, AuthChangePasswordOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(OTP_REPOSITORY)
    private readonly otpRepository: IOtpRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: AuthChangePasswordCommand): Promise<AuthChangePasswordOutputDto> {
    const { userId, input } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Verify OTP first
    const validOtp = await this.otpRepository.findValidOtp(
      user.email,
      input.otpCode,
      EOtpType.CHANGE_PASSWORD,
    );
    if (!validOtp) {
      throw new InvalidOperationException('Invalid or expired OTP');
    }

    const isOldPasswordValid = await this.authService.comparePassword(input.oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      throw new Error('Invalid old password');
    }

    const newHashedPassword = await this.authService.hashPassword(input.newPassword);
    
    user.updatePassword(newHashedPassword);

    await this.userRepository.save(user);

    await this.otpRepository.deleteByEmailAndType(user.email, EOtpType.CHANGE_PASSWORD);

    return { success: true };
  }
}

