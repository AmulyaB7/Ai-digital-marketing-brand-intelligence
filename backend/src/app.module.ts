
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
import { BrandsModule } from './brands/brands.module';
import { MetaAdsModule } from './meta-ads/meta-ads.module';
import { MetaInstagramModule } from './meta-instagram/meta-instagram.module';
import { Mem0Module } from './mem0/mem0.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CustomersModule,
    BrandsModule,
    MetaAdsModule,
    MetaInstagramModule,
    Mem0Module,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
