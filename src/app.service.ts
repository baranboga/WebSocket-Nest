import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "WebSocket Chat API çalışıyor!";
  }
}
