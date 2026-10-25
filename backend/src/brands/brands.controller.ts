
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { BrandsService } from './brands.service';

type Platform = 'instagram' | 'facebook' | 'google_ads';

type ClerkRequest = Request & {
  auth?: {
    org_id?: string;
  };
};

@Controller('brands')
@UseGuards(ClerkAuthGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  private getOrganizationId(request: ClerkRequest): string {
    const organizationId = request.auth?.org_id;

    if (!organizationId) {
      throw new ForbiddenException('An active organization is required');
    }

    return organizationId;
  }

  @Get('summary')
  getSummary(@Req() request: ClerkRequest) {
    return this.brandsService.getSummary(
      this.getOrganizationId(request),
    );
  }

  @Get()
  findAll(@Req() request: ClerkRequest) {
    return this.brandsService.findAll(
      this.getOrganizationId(request),
    );
  }

  @Post()
  create(
    @Req() request: ClerkRequest,
    @Body()
    body: {
      customerId: number;
      name: string;
      industry?: string;
    },
  ) {
    return this.brandsService.create(
      this.getOrganizationId(request),
      {
        ...body,
        customerId: Number(body.customerId),
      },
    );
  }

  @Patch(':id')
  update(
    @Req() request: ClerkRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      industry?: string | null;
      status?: string;
      customerId?: number;
    },
  ) {
    return this.brandsService.update(
      this.getOrganizationId(request),
      id,
      {
        ...body,
        customerId:
          body.customerId === undefined
            ? undefined
            : Number(body.customerId),
      },
    );
  }

  @Get(':id/channels')
  getChannels(
    @Req() request: ClerkRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.brandsService.getChannels(
      this.getOrganizationId(request),
      id,
    );
  }

  @Patch(':id/channels/:platform')
  updateChannel(
    @Req() request: ClerkRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('platform') platform: Platform,
    @Body() body: { status?: string },
  ) {
    return this.brandsService.updateChannel(
      this.getOrganizationId(request),
      id,
      platform,
      body.status,
    );
  }

  @Delete(':id')
  remove(
    @Req() request: ClerkRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.brandsService.remove(
      this.getOrganizationId(request),
      id,
    );
  }
}
