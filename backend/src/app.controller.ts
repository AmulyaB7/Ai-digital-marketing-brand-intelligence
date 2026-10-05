import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('db-test')
  async testDatabase() {
    const result = await this.databaseService.query('SELECT NOW()');

    return {
      message: 'Database connection successful',
      time: result.rows[0].now,
    };
  }
}