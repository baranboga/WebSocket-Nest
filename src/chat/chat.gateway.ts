import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService, Room } from "./chat.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  @SubscribeMessage("sendMessage")
  handleMessage(
    @MessageBody() payload: { message: string; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userName = (client.handshake.query.userName as string) || "Anonim";
    const messageData = {
      message: payload.message,
      userName,
      room: payload.room,
      timestamp: new Date().toISOString(),
    };
    // Önce mesajı kaydet
    this.chatService.addMessage(messageData);
    // Sadece ilgili odadaki kullanıcılara mesajı ilet
    this.server.to(payload.room).emit("newMessage", messageData);

    return { success: true };
  }

  @SubscribeMessage("joinRoom")
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userName = (client.handshake.query.userName as string) || "Anonim";

    // Kullanıcının önceki odalarından çıkmasını sağla
    const previousRooms = this.chatService.getUserRooms(client.id);
    previousRooms.forEach((prevRoom) => {
      client.leave(prevRoom);
      // Odadan ayrılma bilgisini diğer kullanıcılara bildir
      this.server.to(prevRoom).emit("userLeft", { userName, room: prevRoom });
    });

    // Yeni odaya katıl
    client.join(room);

    // Kullanıcının oda bilgisini güncelle
    this.chatService.addUserToRoom(client.id, userName, room);

    // Odaya katılma bilgisini diğer kullanıcılara bildir
    this.server.to(room).emit("userJoined", { userName, room });

    // Odaya özel geçmiş mesajları gönder
    client.emit("previousMessages", this.chatService.getRoomMessages(room));

    // Odadaki kullanıcı listesini gönder
    this.server.to(room).emit("roomUsers", this.chatService.getRoomUsers(room));

    return { success: true };
  }

  @SubscribeMessage("getRooms")
  handleGetRooms(): Room[] {
    return this.chatService.getRooms();
  }

  @SubscribeMessage("createRoom")
  handleCreateRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ): { success: boolean; room: Room } {
    const userName = (client.handshake.query.userName as string) || "Anonim";
    const room = this.chatService.createRoom(roomName, userName);

    // Tüm kullanıcılara yeni oda bilgisini gönder
    this.server.emit("roomCreated", room);

    return { success: true, room };
  }

  handleConnection(client: Socket) {
    console.log(`Client bağlandı: ${client.id}`);
    const userName = (client.handshake.query.userName as string) || "Anonim";

    // Kullanıcıyı kaydet
    this.chatService.addUser(client.id, userName);

    // Mevcut odaları gönder
    client.emit("availableRooms", this.chatService.getRooms());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client ayrıldı: ${client.id}`);

    // Kullanıcının odalarını bul ve bilgilendirme yap
    const rooms = this.chatService.getUserRooms(client.id);
    const userName = this.chatService.getUserName(client.id);

    rooms.forEach((room) => {
      this.server.to(room).emit("userLeft", { userName, room });
    });

    // Kullanıcıyı sistemden çıkar
    this.chatService.removeUser(client.id);
  }
}
