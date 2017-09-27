import * as ws from "ws";
import { Core } from "./core";
import { Collection } from "./storage";

interface IChatMessages {
  type: string,
  messages: IChatMessage[]
}

interface IChatMessage {
  timestamp: number;
  userId: number;
  type: string;
  data: string|Object;
}

export class ClientConnection {

  protected static clients: ClientConnection[] = [];

  public static registerClient(socket: ws): void {
    this.clients.push(new ClientConnection(socket));
  }

  protected socket: ws;
  protected lastSeenOnline: number;

  constructor(socket: ws) {
    this.socket = socket;

    this.socket.on("message", message => this.messageReceived(message));
    this.sendLastMessages();
  }

  public sendMessage(message: string): void {
    try {
      this.socket.send(message);
    }
    catch (err) {
      console.log(err);
    }
  }

  protected messageReceived(message: any): void {
    ClientConnection.clients.forEach(clientConn => {
      if (clientConn != this)  // dont sent to sender
        clientConn.sendMessage(message);
    });

    try {
      let messagesObject: IChatMessages = JSON.parse(message.toString());
      if (!messagesObject.type || !messagesObject.messages)
        return console.log("Wrong message format");
      let timestamp = this.getCurrentTimestamp();
      messagesObject.messages.forEach(mess => {
        if (!mess.type || !mess.data)
          console.log("Wrong message format");
        mess.timestamp = timestamp;
        Core.getStorage().getCollection(Collection.Messages).insertOne(mess, (err, result) => {
          if (err)
            return console.log(err);
        });
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  protected async sendLastMessages() {    
    try {
      let coll = Core.getStorage().getCollection(Collection.Messages);
      let lastMessages = await coll.find().sort({ timestamp: -1 }).limit(50).toArray();
      this.sendMessage(JSON.stringify({
        type: "messages",
        messages: lastMessages
      }));
    }
    catch (e) {
      console.log(e);
    }
  }

  protected getCurrentTimestamp(): number {
    return new Date().getTime();
  }
}
