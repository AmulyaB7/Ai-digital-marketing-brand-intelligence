
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MetaAdsService } from './meta-ads.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('meta-ads')
@UseGuards(ClerkAuthGuard)
export class MetaAdsController {
  constructor(private readonly metaAdsService: MetaAdsService) {}

  @Get('sandbox-account')
  getSandboxAccount() {
    return this.metaAdsService.getSandboxAdAccount();
  }

  @Get('campaigns')
  getCampaigns() {
    return this.metaAdsService.getCampaigns();
  }

  @Post('campaigns')
  createCampaign(@Body() body: { name?: string; objective?: string }) {
    return this.metaAdsService.createPausedCampaign(
      body.name ?? '',
      body.objective ?? '',
    );
  }

  @Get('campaigns/:id/insights')
  getCampaignInsights(@Param('id') id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid campaign ID');
    }

    return this.metaAdsService.getCampaignInsights(id);
  }
}
