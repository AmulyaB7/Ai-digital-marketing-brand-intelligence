
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

import type { Request } from 'express';

import { ContentsService } from './contents.service';

import type {
  CreateContentDto,
  UpdateContentDto,
} from './contents.service';

import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

type AuthenticatedRequest = Request & {
  auth: {
    org_id?: string;
  };
};

@Controller('contents')
@UseGuards(ClerkAuthGuard)
export class ContentsController {
  constructor(
    private readonly contentsService: ContentsService,
  ) {}

  private getOrganizationId(
    request: AuthenticatedRequest,
  ) {
    const orgId = request.auth.org_id;

    if (!orgId) {
      throw new ForbiddenException(
        'No active organization found in the Clerk session',
      );
    }

    return orgId;
  }

  // GET ALL CONTENT
  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.contentsService.findByOrganization(
      this.getOrganizationId(request),
    );
  }

  // CREATE CONTENT
  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() content: CreateContentDto,
  ) {
    return this.contentsService.createForOrganization(
      this.getOrganizationId(request),
      content,
    );
  }

  // UPDATE CONTENT
  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() content: UpdateContentDto,
  ) {
    return this.contentsService.updateForOrganization(
      this.getOrganizationId(request),
      id,
      content,
    );
  }

  // DELETE CONTENT
  @Delete(':id')
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.contentsService.deleteForOrganization(
      this.getOrganizationId(request),
      id,
    );
  }
}
