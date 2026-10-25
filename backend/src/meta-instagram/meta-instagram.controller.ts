import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { MetaInstagramService } from './meta-instagram.service';

type AuthenticatedRequest = Request & {
  auth?: {
    org_id?: string;
  };
};

@Controller('integrations/meta/instagram')
export class MetaInstagramController {
  constructor(private readonly service: MetaInstagramService) {}

  @Post('start')
  @UseGuards(ClerkAuthGuard)
  async start(
    @Req() request: AuthenticatedRequest,
    @Body() body: { brandId?: number },
  ) {
    const clerkOrgId = request.auth?.org_id;

    if (!clerkOrgId) {
      throw new BadRequestException(
        'An active Clerk organization is required',
      );
    }

    const brandId = Number(body.brandId);

    if (!Number.isSafeInteger(brandId) || brandId <= 0) {
      throw new BadRequestException('A valid brandId is required');
    }

    return this.service.startAuthorization(clerkOrgId, brandId);
  }

  @Get('callback')
  async callback(
    @Res() response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') oauthError?: string,
    @Query('error_description') errorDescription?: string,
  ) {
    if (oauthError) {
      const result = this.service.finishWithError(
        `${oauthError} ${errorDescription ?? ''}`,
      );

      return response.redirect(result.redirectUrl);
    }

    if (!code || !state) {
      const result = this.service.finishWithError('missing_callback_data');
      return response.redirect(result.redirectUrl);
    }

    const result = await this.service.handleCallback(code, state);

    return response.redirect(result.redirectUrl);
  }
}