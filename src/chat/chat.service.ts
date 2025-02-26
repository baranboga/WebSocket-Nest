import { Injectable } from "@nestjs/common";

export interface Message {
  message: string;
  userName: string;
  room: string;
  timestamp: string;
}

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  rooms: string[];
}

@Injectable()
export class ChatService {
  private messages: Message[] = [];
  private rooms: Room[] = [
    {
      id: "general",
      name: "Genel",
      createdBy: "system",
      createdAt: new Date().toISOString(),
    },
  ];
  private users: User[] = [];

  addMessage(message: Message) {
    this.messages.push(message);
    // Mesaj sayısını sınırla (opsiyonel)
    if (this.messages.length > 100) {
      this.messages.shift();
    }
  }

  getMessages() {
    return this.messages;
  }

  getRoomMessages(roomId: string) {
    return this.messages.filter((msg) => msg.room === roomId);
  }

  getRooms() {
    return this.rooms;
  }

  createRoom(name: string, createdBy: string): Room {
    const room = {
      id: this.generateRoomId(name),
      name,
      createdBy,
      createdAt: new Date().toISOString(),
    };
    this.rooms.push(room);
    return room;
  }

  private generateRoomId(name: string): string {
    return (
      name.toLowerCase().replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-6)
    );
  }

  addUser(id: string, name: string) {
    const existingUser = this.users.find((user) => user.id === id);
    if (!existingUser) {
      this.users.push({ id, name, rooms: [] });
    }
  }

  removeUser(id: string) {
    this.users = this.users.filter((user) => user.id !== id);
  }

  getUserName(id: string): string {
    const user = this.users.find((user) => user.id === id);
    return user ? user.name : "Anonim";
  }

  addUserToRoom(userId: string, userName: string, roomId: string) {
    const user = this.users.find((user) => user.id === userId);
    if (user) {
      if (!user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
      }
    } else {
      this.users.push({ id: userId, name: userName, rooms: [roomId] });
    }
  }

  getUserRooms(userId: string): string[] {
    const user = this.users.find((user) => user.id === userId);
    return user ? user.rooms : [];
  }

  getRoomUsers(roomId: string): { id: string; name: string }[] {
    return this.users
      .filter((user) => user.rooms.includes(roomId))
      .map((user) => ({ id: user.id, name: user.name }));
  }
}
