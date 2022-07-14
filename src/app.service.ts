import { Injectable } from '@nestjs/common';
import { bot } from './utils/rastreador';
// import bot from './utils/rastreador';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API Rastreadores';
  }
}

bot.launch();
