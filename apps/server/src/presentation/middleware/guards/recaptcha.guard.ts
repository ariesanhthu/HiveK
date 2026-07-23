import { SecurityConfig } from '@/configs';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { FastifyRequest } from 'fastify';

interface RecaptchaBody {
  recaptchaToken?: string;
}

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly securityConfig: SecurityConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest<{ Body: RecaptchaBody; }>>();
    const recaptchaToken = request.body?.recaptchaToken;

    if (!recaptchaToken) {
      throw new ForbiddenException('reCAPTCHA token is missing');
    }

    const secretKey = this.securityConfig.getRecaptchaSecretKey();
    if (!secretKey) {
      // If not configured, bypass or fail depending on environment
      return true;
    }

    try {
      const response = await axios.post<{ success: boolean; }>(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`,
      );

      if (!response.data.success) {
        throw new ForbiddenException('reCAPTCHA verification failed');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('reCAPTCHA verification error');
    }
  }
}
