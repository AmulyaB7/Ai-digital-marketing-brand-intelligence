import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Mem0Service } from './mem0.service';

@Controller('memories')
export class Mem0Controller {
  constructor(private readonly mem0Service: Mem0Service) {}

  // Add a new memory
  @Post()
  async addMemory(
    @Body() body: { userId: string; content: string },
  ) {
    if (!body.userId || !body.content) {
      throw new BadRequestException(
        'Both userId and content are required',
      );
    }

    return this.mem0Service.addMemory(
      body.userId,
      body.content,
    );
  }

  // Get all memories for a specific user
  @Get()
  async getAllMemories(
    @Query('userId') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException(
        'userId query parameter is required',
      );
    }

    return this.mem0Service.getAllMemories(userId);
  }

  // Search memories for a specific user
  @Get('search')
  async searchMemory(
    @Query('userId') userId: string,
    @Query('q') query: string,
  ) {
    if (!userId || !query) {
      throw new BadRequestException(
        'Both userId and q query parameters are required',
      );
    }

    return this.mem0Service.searchMemory(
      userId,
      query,
    );
  }
}