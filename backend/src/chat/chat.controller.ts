import {
  BadRequestException,
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(
    @Body() body: { message?: string; brandName?: string },
  ) {
    const message = body.message?.trim();

    if (!message) {
      throw new BadRequestException('Message is required');
    }

    if (message.length > 10000) {
      throw new BadRequestException('Message is too long');
    }

    return this.chatService.sendMessage(message, body.brandName);
  }
}