import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
// <<<<<<< feature/chat-brand-integration
// import { Mem0Module } from './mem0/mem0.module';
// import { ChatModule } from './chat/chat.module';
// =======
// import { BrandsModule } from './brands/brands.module';
// import { MetaAdsModule } from './meta-ads/meta-ads.module';
// import { MetaInstagramModule } from './meta-instagram/meta-instagram.module';
// >>>>>>> main

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CustomersModule,
// <<<<<<< feature/chat-brand-integration
//     Mem0Module,
//     ChatModule,
// =======
//     BrandsModule,
//     MetaAdsModule,
//     MetaInstagramModule,
// >>>>>>> main
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}