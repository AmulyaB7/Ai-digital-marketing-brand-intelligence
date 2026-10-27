
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import type { Request } from 'express';

type OrganizationClaim = {
  id?: string;
  rol?: string;
  slg?: string;
};

type AuthenticatedRequest = Request & {
  auth?: {
    org_id?: string;
    org_role?: string;
  };
};

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const token = authorization.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        authorizedParties: ['http://localhost:3000'],
      });

      const organization = payload.o as OrganizationClaim | undefined;

      request.auth = {
        org_id: organization?.id,
        org_role: organization?.rol,
      };

      return true;
    } catch (error) {
      console.error('Clerk token verification failed:', error);

      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }
  }
}
