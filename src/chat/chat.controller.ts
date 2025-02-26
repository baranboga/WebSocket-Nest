import { Controller, Get, Post, Body } from "@nestjs/common";
import { ChatService, Message } from "./chat.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

class MessageDto {
  message: string;
  userName: string;
}

@ApiTags("chat")
@Controller("chat")
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get("messages")
  @ApiOperation({ summary: "Tüm mesajları getir" })
  @ApiResponse({ status: 200, description: "Mesajlar başarıyla alındı" })
  getMessages() {
    return this.chatService.getMessages();
  }

  @Post("message")
  @ApiOperation({ summary: "Yeni mesaj gönder (REST API üzerinden)" })
  @ApiResponse({ status: 201, description: "Mesaj başarıyla gönderildi" })
  addMessage(@Body() messageData: Message) {
    this.chatService.addMessage(messageData);
    return { success: true };
  }

  @Get("rooms")
  getRooms() {
    return this.chatService.getRooms();
  }
}
