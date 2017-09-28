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

  public static Init() {
    setInterval(() => {
      ClientConnection.Idle();
    }, 3000);
  }

  protected static Idle() {
    let clientsAlive = [];
    ClientConnection.clients.forEach(client => {
      let currTime = ClientConnection.getCurrentTimestamp();
      let diff = currTime - client.lastSeenOnline;
      if (diff > 15000 && diff < 30000)
        client.sendMessage("ping");
      if (diff < 40000)
        clientsAlive.push(client);
      else
        client.socket.close();
    });
    ClientConnection.clients = clientsAlive;
  }

  protected socket: ws;
  protected lastSeenOnline: number;

  constructor(socket: ws) {
    this.socket = socket;

    this.socket.on("message", message => this.messageReceived(message));    
    this.lastSeenOnline = ClientConnection.getCurrentTimestamp();
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
    let timestamp = ClientConnection.getCurrentTimestamp();
    this.lastSeenOnline = timestamp;
    if (message == "ping")
      return;
    if (message == "history") {
      this.sendLastMessages();
      return;
    }

    ClientConnection.clients.forEach(clientConn => {
      if (clientConn != this)  // dont send to sender
        clientConn.sendMessage(message);
    });

    try {
      let messagesObject: IChatMessages = JSON.parse(message.toString());
      if (!messagesObject.type || !messagesObject.messages)
        return console.log("Wrong message format");
      
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

  protected static getCurrentTimestamp(): number {
    return new Date().getTime();
  }
}
