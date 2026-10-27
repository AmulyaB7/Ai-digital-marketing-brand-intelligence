
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const ALLOWED_OBJECTIVES = [
  'OUTCOME_TRAFFIC',
  'OUTCOME_AWARENESS',
  'OUTCOME_ENGAGEMENT',
  'OUTCOME_LEADS',
  'OUTCOME_SALES',
  'OUTCOME_APP_PROMOTION',
];

@Injectable()
export class MetaAdsService {
  constructor(private readonly configService: ConfigService) {}

  private getCredentials() {
    const accessToken =
      this.configService.get<string>('META_ACCESS_TOKEN');
    const adAccountId =
      this.configService.get<string>('META_AD_ACCOUNT_ID');

    if (!accessToken || !adAccountId) {
      throw new InternalServerErrorException(
        'Meta Ads credentials are not configured',
      );
    }

    return { accessToken, adAccountId };
  }

  private async metaRequest(url: URL, options?: RequestInit) {
    let response: Response;

    try {
      response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Could not connect to the Meta Marketing API',
      );
    }

    const result = await response.json();

    if (!response.ok) {
      throw new ServiceUnavailableException({
        message: 'Meta Marketing API request failed',
        details: result?.error?.message ?? 'Unknown Meta API error',
        code: result?.error?.code,
        subcode: result?.error?.error_subcode,
      });
    }

    return result;
  }

  async getSandboxAdAccount() {
    const { accessToken, adAccountId } = this.getCredentials();

    const url = new URL(
      `https://graph.facebook.com/v24.0/${adAccountId}`,
    );

    url.searchParams.set(
      'fields',
      'id,account_id,name,account_status,currency,timezone_name',
    );
    url.searchParams.set('access_token', accessToken);

    const result = await this.metaRequest(url);

    return { connected: true, account: result };
  }

  async createPausedCampaign(name: string, objective: string) {
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      throw new BadRequestException(
        'Campaign name must be between 1 and 100 characters',
      );
    }

    if (!ALLOWED_OBJECTIVES.includes(objective)) {
      throw new BadRequestException('Unsupported campaign objective');
    }

    const { accessToken, adAccountId } = this.getCredentials();

    const url = new URL(
      `https://graph.facebook.com/v24.0/${adAccountId}/campaigns`,
    );

    const body = new URLSearchParams({
      access_token: accessToken,
      name: name.trim(),
      objective,
      status: 'PAUSED',
      special_ad_categories: JSON.stringify([]),
      is_adset_budget_sharing_enabled: 'false',
    });

    const result = await this.metaRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    return {
      success: true,
      message: 'Campaign created in PAUSED status',
      campaign: result,
    };
  }

  async getCampaigns() {
    const { accessToken, adAccountId } = this.getCredentials();

    const url = new URL(
      `https://graph.facebook.com/v24.0/${adAccountId}/campaigns`,
    );

    url.searchParams.set(
      'fields',
      'id,name,objective,status,effective_status,created_time',
    );
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('limit', '50');

    const result = await this.metaRequest(url);

    return {
      success: true,
      campaigns: result.data ?? [],
      paging: result.paging ?? null,
    };
  }

  async getCampaignInsights(campaignId: string) {
    if (!/^\d+$/.test(campaignId)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    const { accessToken } = this.getCredentials();

    const url = new URL(
      `https://graph.facebook.com/v24.0/${campaignId}/insights`,
    );

    url.searchParams.set(
      'fields',
      'impressions,clicks,spend,reach,ctr',
    );
    url.searchParams.set('date_preset', 'last_30d');
    url.searchParams.set('access_token', accessToken);

    const result = await this.metaRequest(url);

    return {
      success: true,
      campaignId,
      period: 'last_30d',
      insights: result.data ?? [],
    };
  }
}
