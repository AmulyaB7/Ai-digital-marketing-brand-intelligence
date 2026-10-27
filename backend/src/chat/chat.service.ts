
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly groq: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing from backend/.env');
    }

    this.groq = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async sendMessage(message: string, brandName?: string) {
    const instructions = brandName
      ? `You are a helpful digital marketing assistant for "${brandName}". Give practical marketing advice. Do not invent brand facts that have not been provided.`
      : 'You are a helpful digital marketing assistant. Give practical marketing advice.';

    try {
      const response = await this.groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: message },
        ],
      });

      return {
        reply: response.choices[0]?.message?.content ?? '',
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error('Groq API error:', {
          status: error.status,
          message: error.message,
          code: error.code,
        });
      } else {
        console.error('Groq request failed:', error);
      }

      throw new InternalServerErrorException(
        'Unable to generate a response. Please try again.',
      );
    }
  }
}
