import { Controller, Get, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query('orgId') orgId: string) {
    return this.customersService.findByOrganization(orgId);
  }
}