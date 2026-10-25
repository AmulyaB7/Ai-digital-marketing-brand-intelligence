import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MetaInstagramController } from './meta-instagram.controller';
import { MetaInstagramService } from './meta-instagram.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MetaInstagramController],
  providers: [MetaInstagramService],
})
export class MetaInstagramModule {}