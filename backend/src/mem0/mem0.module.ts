
import { Module } from '@nestjs/common';
import { Mem0Service } from './mem0.service';
import { Mem0Controller } from './mem0.controller';

@Module({
  controllers: [Mem0Controller],
  providers: [Mem0Service],
  exports: [Mem0Service],
})
export class Mem0Module {}
