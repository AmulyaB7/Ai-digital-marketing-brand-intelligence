
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export type CreateContentDto = {
  title: string;
  description?: string | null;
  brand: string;
  platform: 'Instagram' | 'Facebook' | 'Google Ads';
  status?: 'Draft' | 'Approved' | 'Published';
  scheduled_at?: string | null;
};

export type UpdateContentDto = {
  title?: string;
  description?: string | null;
  brand?: string;
  platform?: 'Instagram' | 'Facebook' | 'Google Ads';
  status?: 'Draft' | 'Approved' | 'Published';
  scheduled_at?: string | null;
};

@Injectable()
export class ContentsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // GET ALL CONTENT
  async findByOrganization(clerkOrgId: string) {
    const result = await this.databaseService.query(
      `
      SELECT
        id,
        title,
        description,
        brand,
        platform,
        status,
        scheduled_at,
        created_at,
        updated_at
      FROM contents
      WHERE clerk_org_id = $1
      ORDER BY created_at DESC, id DESC;
      `,
      [clerkOrgId],
    );

    return result.rows;
  }

  // CREATE CONTENT
  async createForOrganization(
    clerkOrgId: string,
    content: CreateContentDto,
  ) {
    const result = await this.databaseService.query(
      `
      INSERT INTO contents (
        clerk_org_id,
        title,
        description,
        brand,
        platform,
        status,
        scheduled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        clerkOrgId,
        content.title.trim(),
        content.description?.trim() || null,
        content.brand.trim(),
        content.platform,
        content.status ?? 'Draft',
        content.scheduled_at || null,
      ],
    );

    return result.rows[0];
  }

  // UPDATE CONTENT
  async updateForOrganization(
    clerkOrgId: string,
    id: number,
    content: UpdateContentDto,
  ) {
    const result = await this.databaseService.query(
      `
      UPDATE contents
      SET
        title = COALESCE($1, title),

        description = CASE
          WHEN $2::boolean THEN $3::text
          ELSE description
        END,

        brand = COALESCE($4, brand),
        platform = COALESCE($5, platform),
        status = COALESCE($6, status),

        scheduled_at = CASE
          WHEN $7::boolean THEN $8::timestamp
          ELSE scheduled_at
        END,

        updated_at = CURRENT_TIMESTAMP

      WHERE clerk_org_id = $9
        AND id = $10

      RETURNING *;
      `,
      [
        content.title?.trim() || null,
        Object.prototype.hasOwnProperty.call(content, 'description'),
        content.description?.trim() || null,
        content.brand?.trim() || null,
        content.platform ?? null,
        content.status ?? null,
        Object.prototype.hasOwnProperty.call(content, 'scheduled_at'),
        content.scheduled_at || null,
        clerkOrgId,
        id,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Content not found in this organization',
      );
    }

    return result.rows[0];
  }

  // DELETE CONTENT
  async deleteForOrganization(
    clerkOrgId: string,
    id: number,
  ) {
    const result = await this.databaseService.query(
      `
      DELETE FROM contents
      WHERE clerk_org_id = $1
        AND id = $2
      RETURNING id, title;
      `,
      [clerkOrgId, id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Content not found in this organization',
      );
    }

    return {
      message: 'Content deleted successfully',
      content: result.rows[0],
    };
  }
}
