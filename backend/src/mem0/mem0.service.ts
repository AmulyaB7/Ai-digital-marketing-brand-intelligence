import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MemoryClient from 'mem0ai';

@Injectable()
export class Mem0Service {
  private readonly memory: MemoryClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('MEM0_API_KEY');

    if (!apiKey) {
      throw new Error('MEM0_API_KEY is missing from backend/.env');
    }

    this.memory = new MemoryClient({ apiKey });
  }

  // Add a memory for a specific user
  async addMemory(userId: string, content: string) {
    if (!userId?.trim() || !content?.trim()) {
      throw new BadRequestException(
        'userId and content are required',
      );
    }

    return this.memory.add(
      [{ role: 'user', content }],
      { userId },
    );
  }

  // Search memories belonging to a specific user
  async searchMemory(userId: string, query: string) {
    if (!userId?.trim() || !query?.trim()) {
      throw new BadRequestException(
        'userId and query are required',
      );
    }

    return this.memory.search(query, {
      filters: { user_id: userId },
    });
  }

  // Retrieve all memories belonging to a specific user
  async getAllMemories(userId: string): Promise<unknown> {
    if (!userId?.trim()) {
      throw new BadRequestException(
        'A valid userId is required',
      );
    }

    return this.memory.getAll({
      filters: { user_id: userId },
    });
  }
}