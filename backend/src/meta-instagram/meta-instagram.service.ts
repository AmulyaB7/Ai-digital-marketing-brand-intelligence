import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto';
import { DatabaseService } from '../database/database.service';

const GRAPH_VERSION = 'v24.0';
const FRONTEND_DEFAULT = 'http://localhost:3000';

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: {
    message?: string;
  };
};

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
};

type InstagramProfile = {
  id?: string;
  username?: string;
  name?: string;
  error?: {
    message?: string;
  };
};

@Injectable()
export class MetaInstagramService {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  private required(name: string): string {
    const value = this.config.get<string>(name)?.trim();

    if (!value) {
      throw new InternalServerErrorException(
        `Meta Instagram configuration is missing: ${name}`,
      );
    }

    return value;
  }

  private frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL')?.trim() ||
      FRONTEND_DEFAULT
    );
  }

  private encryptionKey(): Buffer {
    const encoded = this.required('META_TOKEN_ENCRYPTION_KEY');
    const key = Buffer.from(encoded, 'base64');

    if (key.length !== 32) {
      throw new InternalServerErrorException(
        'META_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key',
      );
    }

    return key;
  }

  private encryptToken(token: string): string {
    const iv = randomBytes(12);

    const cipher = createCipheriv(
      'aes-256-gcm',
      this.encryptionKey(),
      iv,
    );

    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted.toString('base64'),
    ].join('.');
  }

  private decryptToken(encryptedToken: string): string {
    const parts = encryptedToken.split('.');

    if (parts.length !== 4 || parts[0] !== 'v1') {
      throw new InternalServerErrorException(
        'Stored token has an unsupported encryption format',
      );
    }

    const [, ivEncoded, tagEncoded, dataEncoded] = parts;

    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.encryptionKey(),
        Buffer.from(ivEncoded, 'base64'),
      );

      decipher.setAuthTag(Buffer.from(tagEncoded, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataEncoded, 'base64')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException(
        'Could not decrypt the stored Instagram token',
      );
    }
  }

  private async graphGet<T>(url: URL): Promise<T> {
    let response: Response;

    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Could not connect to Meta. Please try again.',
      );
    }

    const result = (await response.json().catch(() => ({}))) as T & {
      error?: {
        message?: string;
      };
    };

    if (!response.ok) {
      throw new BadRequestException(
        result.error?.message || 'Meta rejected the request',
      );
    }

    return result;
  }

  async startAuthorization(
    clerkOrgId: string,
    brandId: number,
  ) {
    const brand = await this.database.query(
      `SELECT b.id
       FROM brands b
       INNER JOIN organizations o
         ON o.id = b.organization_id
       WHERE b.id = $1
         AND o.clerk_org_id = $2`,
      [brandId, clerkOrgId],
    );

    if (brand.rows.length === 0) {
      throw new NotFoundException(
        'Brand not found in your organization',
      );
    }

    const appId = this.required('META_APP_ID');
    const configId = this.required('META_LOGIN_CONFIG_ID');
    const redirectUri = this.required('META_OAUTH_REDIRECT_URI');

    const state = randomBytes(32).toString('hex');
    const stateHash = createHash('sha256')
      .update(state)
      .digest('hex');

    await this.database.query(
      `INSERT INTO brand_channels (
         brand_id,
         platform,
         status,
         oauth_state_hash,
         oauth_state_expires_at
       )
       VALUES (
         $1,
         'instagram',
         'disconnected',
         $2,
         NOW() + INTERVAL '10 minutes'
       )
       ON CONFLICT (brand_id, platform)
       DO UPDATE SET
         oauth_state_hash = EXCLUDED.oauth_state_hash,
         oauth_state_expires_at = EXCLUDED.oauth_state_expires_at,
         updated_at = CURRENT_TIMESTAMP`,
      [brandId, stateHash],
    );

    const authorizationUrl = new URL(
      `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`,
    );

    authorizationUrl.searchParams.set('client_id', appId);
    authorizationUrl.searchParams.set('redirect_uri', redirectUri);
    authorizationUrl.searchParams.set('state', state);
    authorizationUrl.searchParams.set('config_id', configId);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set(
      'override_default_response_type',
      'true',
    );

    return {
      authorizationUrl: authorizationUrl.toString(),
    };
  }

  async handleCallback(code: string, state: string) {
    if (state.length < 32 || state.length > 256) {
      return this.redirectResult('error', 'invalid_state');
    }

    const stateHash = createHash('sha256')
      .update(state)
      .digest('hex');

    const pending = await this.database.query(
      `UPDATE brand_channels
       SET oauth_state_hash = NULL,
           oauth_state_expires_at = NULL
       WHERE platform = 'instagram'
         AND oauth_state_hash = $1
         AND oauth_state_expires_at > NOW()
       RETURNING brand_id`,
      [stateHash],
    );

    if (pending.rows.length === 0) {
      return this.redirectResult(
        'error',
        'invalid_or_expired_state',
      );
    }

    const brandId = Number(pending.rows[0].brand_id);

    const appId = this.required('META_APP_ID');
    const appSecret = this.required('META_APP_SECRET');
    const redirectUri = this.required('META_OAUTH_REDIRECT_URI');

    const tokenUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    );

    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const shortToken =
      await this.graphGet<MetaTokenResponse>(tokenUrl);

    if (!shortToken.access_token) {
      throw new BadRequestException(
        'Meta did not return an access token',
      );
    }

    const longTokenUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    );

    longTokenUrl.searchParams.set(
      'grant_type',
      'fb_exchange_token',
    );
    longTokenUrl.searchParams.set('client_id', appId);
    longTokenUrl.searchParams.set('client_secret', appSecret);
    longTokenUrl.searchParams.set(
      'fb_exchange_token',
      shortToken.access_token,
    );

    const longToken =
      await this.graphGet<MetaTokenResponse>(longTokenUrl);

    const userToken =
      longToken.access_token || shortToken.access_token;

    const pagesUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts`,
    );

    pagesUrl.searchParams.set(
      'fields',
      'id,name,access_token,instagram_business_account',
    );
    pagesUrl.searchParams.set('access_token', userToken);

    const pagesResult = await this.graphGet<{
      data?: MetaPage[];
    }>(pagesUrl);

    const eligiblePages = (pagesResult.data || []).filter(
      (page) =>
        page.id &&
        page.access_token &&
        page.instagram_business_account?.id,
    );

    if (eligiblePages.length === 0) {
      return this.redirectResult(
        'error',
        'no_linked_professional_instagram',
      );
    }

    if (eligiblePages.length > 1) {
      return this.redirectResult(
        'error',
        'multiple_instagram_accounts',
      );
    }

    const page = eligiblePages[0];
    const instagramAccountId =
      page.instagram_business_account!.id;

    const tokenExpiresIn = Number(
      longToken.expires_in || shortToken.expires_in || 0,
    );

    const expiresAt =
      tokenExpiresIn > 0
        ? new Date(Date.now() + tokenExpiresIn * 1000)
        : null;

    await this.database.query(
      `UPDATE brand_channels
       SET status = 'connected',
           external_account_id = $1,
           external_page_id = $2,
           external_account_name = $3,
           user_access_token_encrypted = $4,
           access_token_encrypted = $5,
           token_expires_at = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE brand_id = $7
         AND platform = 'instagram'`,
      [
        instagramAccountId,
        page.id,
        page.name,
        this.encryptToken(userToken),
        this.encryptToken(page.access_token),
        expiresAt,
        brandId,
      ],
    );

    return this.redirectResult(
      'success',
      'connected',
      brandId,
    );
  }

  async verifyConnection(
    clerkOrgId: string,
    brandId: number,
  ) {
    const result = await this.database.query(
      `SELECT
         bc.status,
         bc.external_account_id,
         bc.external_page_id,
         bc.external_account_name,
         bc.access_token_encrypted
       FROM brand_channels bc
       INNER JOIN brands b
         ON b.id = bc.brand_id
       INNER JOIN organizations o
         ON o.id = b.organization_id
       WHERE bc.brand_id = $1
         AND bc.platform = 'instagram'
         AND o.clerk_org_id = $2`,
      [brandId, clerkOrgId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'Instagram connection not found for this brand',
      );
    }

    const connection = result.rows[0];

    if (
      connection.status !== 'connected' ||
      !connection.external_account_id ||
      !connection.access_token_encrypted
    ) {
      throw new BadRequestException(
        'Instagram is not connected for this brand',
      );
    }

    const pageToken = this.decryptToken(
      connection.access_token_encrypted,
    );

    const profileUrl = new URL(
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(
        String(connection.external_account_id),
      )}`,
    );

    profileUrl.searchParams.set('fields', 'id,username,name');
    profileUrl.searchParams.set('access_token', pageToken);

    const profile = await this.graphGet<InstagramProfile>(
      profileUrl,
    );

    return {
      verified: true,
      brandId,
      instagram: {
        id: profile.id ?? null,
        username: profile.username ?? null,
        name: profile.name ?? null,
      },
    };
  }

  finishWithError(message: string) {
    const safeReason = /access_denied|cancel/i.test(message)
      ? 'authorization_cancelled'
      : 'authorization_failed';

    return this.redirectResult('error', safeReason);
  }

  private redirectResult(
    status: 'success' | 'error',
    reason: string,
    brandId?: number,
  ) {
    const url = new URL(
      '/dashboard/brands',
      this.frontendUrl(),
    );

    url.searchParams.set('meta_connect', status);
    url.searchParams.set('reason', reason);

    if (brandId) {
      url.searchParams.set('brandId', String(brandId));
    }

    return {
      redirectUrl: url.toString(),
    };
  }
}