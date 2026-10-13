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
import { CustomersService } from './customers.service';
import type {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './customers.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

type AuthenticatedRequest = Request & {
  auth: {
    org_id?: string;
  };
};

@Controller('customers')
@UseGuards(ClerkAuthGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  private getOrganizationId(request: AuthenticatedRequest) {
    const orgId = request.auth.org_id;

    if (!orgId) {
      throw new ForbiddenException(
        'No active organization found in the Clerk session',
      );
    }

    return orgId;
  }

  @Get('summary')
  getSummary(@Req() request: AuthenticatedRequest) {
    return this.customersService.getSummary(
      this.getOrganizationId(request),
    );
  }

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.customersService.findByOrganization(
      this.getOrganizationId(request),
    );
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() customer: CreateCustomerDto,
  ) {
    return this.customersService.createForOrganization(
      this.getOrganizationId(request),
      customer,
    );
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() customer: UpdateCustomerDto,
  ) {
    return this.customersService.updateForOrganization(
      this.getOrganizationId(request),
      id,
      customer,
    );
  }

  @Delete(':id')
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customersService.deleteForOrganization(
      this.getOrganizationId(request),
      id,
    );
  }
}