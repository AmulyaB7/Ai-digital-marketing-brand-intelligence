import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByOrganization(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id,
        c.customer_id,
        c.customer_name,
        c.segment,
        c.country,
        c.city,
        c.state,
        c.postal_code,
        c.region,
        c.created_at
      FROM customers c
      JOIN organizations o
        ON c.organization_id = o.id
      WHERE o.clerk_org_id = $1
      ORDER BY c.id;
      `,
      [clerkOrgId],
    );

    return result.rows;
  }
}