import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

export type CreateCustomerDto = {
  customer_name: string;
  email?: string | null;
  phone?: string | null;
};

export type UpdateCustomerDto = {
  customer_name?: string;
  email?: string | null;
  phone?: string | null;
  status?: 'active' | 'inactive';
};

@Injectable()
export class CustomersService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findByOrganization(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        c.id,
        c.customer_id,
        c.customer_name,
        c.email,
        c.phone,
        c.status,
        c.created_at,
        c.updated_at
      FROM customers c
      JOIN organizations o ON c.organization_id = o.id
      WHERE o.clerk_org_id = $1
      ORDER BY c.created_at DESC NULLS LAST, c.id DESC;
      `,
      [clerkOrgId],
    );

    return result.rows;
  }

  async getSummary(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        COUNT(*)::int AS total_customers,
        COUNT(*) FILTER (
          WHERE LOWER(c.status) = 'active'
        )::int AS active_customers,
        COUNT(*) FILTER (
          WHERE c.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        )::int AS added_last_30_days,
        COUNT(*) FILTER (
          WHERE c.phone IS NOT NULL AND BTRIM(c.phone) <> ''
        )::int AS customers_with_phone
      FROM customers c
      JOIN organizations o ON c.organization_id = o.id
      WHERE o.clerk_org_id = $1;
      `,
      [clerkOrgId],
    );

    return result.rows[0];
  }

  async createForOrganization(
    clerkOrgId: string,
    customer: CreateCustomerDto,
  ) {
    const organization = await this.databaseService.query(
      `
      SELECT id
      FROM organizations
      WHERE clerk_org_id = $1;
      `,
      [clerkOrgId],
    );

    if (organization.rows.length === 0) {
      throw new NotFoundException(
        'Organization is not registered in the database',
      );
    }

    const customerId = `CUST-${randomUUID()}`;

    const result = await this.databaseService.query(
      `
      INSERT INTO customers (
        organization_id,
        customer_id,
        customer_name,
        email,
        phone,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING
        id,
        customer_id,
        customer_name,
        email,
        phone,
        status,
        created_at,
        updated_at;
      `,
      [
        organization.rows[0].id,
        customerId,
        customer.customer_name.trim(),
        customer.email?.trim() || null,
        customer.phone?.trim() || null,
      ],
    );

    return result.rows[0];
  }

  async updateForOrganization(
    clerkOrgId: string,
    customerId: number,
    customer: UpdateCustomerDto,
  ) {
    const result = await this.databaseService.query(
      `
      UPDATE customers AS c
      SET
        customer_name = COALESCE($1, c.customer_name),
        email = CASE
          WHEN $2::boolean THEN $3::varchar
          ELSE c.email
        END,
        phone = CASE
          WHEN $4::boolean THEN $5::varchar
          ELSE c.phone
        END,
        status = COALESCE($6, c.status),
        updated_at = CURRENT_TIMESTAMP
      FROM organizations AS o
      WHERE c.organization_id = o.id
        AND o.clerk_org_id = $7
        AND c.id = $8
      RETURNING
        c.id,
        c.customer_id,
        c.customer_name,
        c.email,
        c.phone,
        c.status,
        c.created_at,
        c.updated_at;
      `,
      [
        customer.customer_name?.trim() || null,
        Object.prototype.hasOwnProperty.call(customer, 'email'),
        customer.email?.trim() || null,
        Object.prototype.hasOwnProperty.call(customer, 'phone'),
        customer.phone?.trim() || null,
        customer.status ?? null,
        clerkOrgId,
        customerId,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Customer not found in this organization',
      );
    }

    return result.rows[0];
  }

  async deleteForOrganization(
    clerkOrgId: string,
    customerId: number,
  ) {
    const result = await this.databaseService.query(
      `
      DELETE FROM customers AS c
      USING organizations AS o
      WHERE c.organization_id = o.id
        AND o.clerk_org_id = $1
        AND c.id = $2
      RETURNING
        c.id,
        c.customer_id,
        c.customer_name;
      `,
      [clerkOrgId, customerId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Customer not found in this organization',
      );
    }

    return {
      message: 'Customer deleted successfully',
      customer: result.rows[0],
    };
  }
}