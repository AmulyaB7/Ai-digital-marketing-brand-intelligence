
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type Platform = 'instagram' | 'facebook' | 'google_ads';
type ChannelStatus = 'connected' | 'disconnected';

const PLATFORMS: Platform[] = [
  'instagram',
  'facebook',
  'google_ads',
];

@Injectable()
export class BrandsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  private async findOrganizationBrand(
    clerkOrgId: string,
    brandId: number,
  ) {
    const result = await this.databaseService.query(
      `
      SELECT b.id
      FROM brands b
      INNER JOIN organizations o
        ON b.organization_id = o.id
      WHERE b.id = $1
        AND o.clerk_org_id = $2
      `,
      [brandId, clerkOrgId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Brand not found in your organization',
      );
    }
  }

  async getSummary(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        COUNT(DISTINCT b.id)::int AS total_brands,
        COUNT(DISTINCT b.id) FILTER (
          WHERE bc.platform = 'instagram'
            AND bc.status = 'connected'
        )::int AS instagram_connected,
        COUNT(DISTINCT b.id) FILTER (
          WHERE bc.platform = 'facebook'
            AND bc.status = 'connected'
        )::int AS facebook_connected,
        COUNT(DISTINCT b.id) FILTER (
          WHERE bc.platform = 'google_ads'
            AND bc.status = 'connected'
        )::int AS google_ads_connected
      FROM brands b
      INNER JOIN organizations o
        ON b.organization_id = o.id
      LEFT JOIN brand_channels bc
        ON bc.brand_id = b.id
      WHERE o.clerk_org_id = $1
      `,
      [clerkOrgId],
    );

    const row = result.rows[0];

    return {
      totalBrands: row.total_brands,
      instagramConnected: row.instagram_connected,
      facebookConnected: row.facebook_connected,
      googleAdsConnected: row.google_ads_connected,
    };
  }

  async findAll(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        b.id,
        b.name,
        b.industry,
        b.status,
        b.created_at,
        b.updated_at,
        c.id AS customer_id,
        c.customer_name AS customer_name,
        COALESCE(
          json_agg(
            json_build_object(
              'platform', bc.platform,
              'status', bc.status,
              'external_account_id', bc.external_account_id
            )
          ) FILTER (WHERE bc.id IS NOT NULL),
          '[]'::json
        ) AS channels
      FROM brands b
      INNER JOIN organizations o
        ON b.organization_id = o.id
      INNER JOIN customers c
        ON b.customer_id = c.id
      LEFT JOIN brand_channels bc
        ON bc.brand_id = b.id
      WHERE o.clerk_org_id = $1
      GROUP BY
        b.id,
        b.name,
        b.industry,
        b.status,
        b.created_at,
        b.updated_at,
        c.id,
        c.customer_name
      ORDER BY b.created_at DESC, b.id DESC
      `,
      [clerkOrgId],
    );

    return result.rows;
  }

  async create(
    clerkOrgId: string,
    data: {
      customerId: number;
      name: string;
      industry?: string;
    },
  ) {
    const name = data.name?.trim();

    if (!name) {
      throw new BadRequestException(
        'Brand name is required',
      );
    }

    if (
      !Number.isInteger(data.customerId) ||
      data.customerId <= 0
    ) {
      throw new BadRequestException(
        'A valid customer is required',
      );
    }

    const customerResult =
      await this.databaseService.query(
        `
        SELECT c.id, c.organization_id
        FROM customers c
        INNER JOIN organizations o
          ON c.organization_id = o.id
        WHERE c.id = $1
          AND o.clerk_org_id = $2
        `,
        [data.customerId, clerkOrgId],
      );

    if (customerResult.rows.length === 0) {
      throw new NotFoundException(
        'Customer not found in your organization',
      );
    }

    const organizationId =
      customerResult.rows[0].organization_id;

    const result = await this.databaseService.query(
      `
      INSERT INTO brands (
        organization_id,
        customer_id,
        name,
        industry,
        status
      )
      VALUES ($1, $2, $3, $4, 'Active')
      RETURNING *
      `,
      [
        organizationId,
        data.customerId,
        name,
        data.industry?.trim() || null,
      ],
    );

    return result.rows[0];
  }

  async update(
    clerkOrgId: string,
    id: number,
    data: {
      name?: string;
      industry?: string | null;
      status?: string;
      customerId?: number;
    },
  ) {
    const existingResult =
      await this.databaseService.query(
        `
        SELECT b.id, b.organization_id
        FROM brands b
        INNER JOIN organizations o
          ON b.organization_id = o.id
        WHERE b.id = $1
          AND o.clerk_org_id = $2
        `,
        [id, clerkOrgId],
      );

    if (existingResult.rows.length === 0) {
      throw new NotFoundException('Brand not found');
    }

    const existing = existingResult.rows[0];
    const name =
      data.name === undefined
        ? undefined
        : data.name.trim();

    if (name !== undefined && !name) {
      throw new BadRequestException(
        'Brand name cannot be empty',
      );
    }

    if (
      data.status !== undefined &&
      !['Active', 'Inactive'].includes(data.status)
    ) {
      throw new BadRequestException(
        'Status must be Active or Inactive',
      );
    }

    if (data.customerId !== undefined) {
      if (
        !Number.isInteger(data.customerId) ||
        data.customerId <= 0
      ) {
        throw new BadRequestException(
          'A valid customer is required',
        );
      }

      const customerResult =
        await this.databaseService.query(
          `
          SELECT c.id
          FROM customers c
          INNER JOIN organizations o
            ON c.organization_id = o.id
          WHERE c.id = $1
            AND o.clerk_org_id = $2
          `,
          [data.customerId, clerkOrgId],
        );

      if (customerResult.rows.length === 0) {
        throw new NotFoundException(
          'Customer not found in your organization',
        );
      }
    }

    const result = await this.databaseService.query(
      `
      UPDATE brands
      SET
        name = COALESCE($1, name),
        industry = CASE
          WHEN $2::boolean THEN $3::varchar
          ELSE industry
        END,
        status = COALESCE($4, status),
        customer_id = COALESCE($5, customer_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
        AND organization_id = $7
      RETURNING *
      `,
      [
        name ?? null,
        data.industry !== undefined,
        data.industry?.trim() || null,
        data.status ?? null,
        data.customerId ?? null,
        id,
        existing.organization_id,
      ],
    );

    return result.rows[0];
  }

  async getChannels(
    clerkOrgId: string,
    brandId: number,
  ) {
    await this.findOrganizationBrand(
      clerkOrgId,
      brandId,
    );

    const result = await this.databaseService.query(
      `
      SELECT
        p.platform,
        COALESCE(bc.status, 'disconnected') AS status,
        bc.external_account_id
      FROM (
        VALUES
          ('instagram'),
          ('facebook'),
          ('google_ads')
      ) AS p(platform)
      LEFT JOIN brand_channels bc
        ON bc.brand_id = $1
        AND bc.platform = p.platform
      ORDER BY p.platform
      `,
      [brandId],
    );

    return result.rows;
  }

  async updateChannel(
    clerkOrgId: string,
    brandId: number,
    platform: string,
    status?: string,
  ) {
    if (!PLATFORMS.includes(platform as Platform)) {
      throw new BadRequestException(
        'Platform must be instagram, facebook, or google_ads',
      );
    }

    if (
      status !== 'connected' &&
      status !== 'disconnected'
    ) {
      throw new BadRequestException(
        'Status must be connected or disconnected',
      );
    }

    await this.findOrganizationBrand(
      clerkOrgId,
      brandId,
    );

    const result = await this.databaseService.query(
      `
      INSERT INTO brand_channels (
        brand_id,
        platform,
        status
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (brand_id, platform)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        platform,
        status,
        external_account_id
      `,
      [brandId, platform, status],
    );

    return result.rows[0];
  }

  async remove(clerkOrgId: string, id: number) {
    const result = await this.databaseService.query(
      `
      DELETE FROM brands b
      USING organizations o
      WHERE b.organization_id = o.id
        AND o.clerk_org_id = $1
        AND b.id = $2
      RETURNING b.id
      `,
      [clerkOrgId, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Brand not found');
    }

    return {
      message: 'Brand deleted successfully',
      id: result.rows[0].id,
    };
  }
}
