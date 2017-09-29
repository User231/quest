import * as ws from "ws";
import { Core } from "./core";
import { Collection } from "./storage";

interface IChatMessages {
  type: string,
  messages: IChatMessage[]
}

interface IPoint {
  lat: number;
  lng: number;
}

interface IPolyline {
  type: string,
  messages: IPoint[]
}

interface IChatMessage {
  timestamp: number;
  userId: number;
  type: string;
  data: string|Object;
}

export class ClientConnection {

  protected static clients: ClientConnection[] = [];

  protected static polyline: IPoint[] = [];

  public static registerClient(socket: ws): void {
    this.clients.push(new ClientConnection(socket));
  }

  public static Init() {
    setInterval(() => {
      ClientConnection.Idle();
    }, 3000);

    setTimeout(async () => {
      let polyLinesCollection = Core.getStorage().getCollection(Collection.MapPolylines);
      let entry = await polyLinesCollection.findOne({xx: 33});
      if (!entry)
        await polyLinesCollection.insertOne({xx: 33, messages: []});
      ClientConnection.polyline = (await polyLinesCollection.findOne({xx: 33})).messages;
      setInterval(() => {
        polyLinesCollection.updateOne({xx: 33}, {xx: 33, messages: ClientConnection.polyline}, (err, result) => {
          if (err)
            return console.log(err);
        });
      }, 30000);
    }, 1000);
    /**/
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

  public static reportPosition(lat: number, lng: number) {
    this.polyline.push({lat: lat, lng: lng});
    ClientConnection.clients.forEach(clientConn => {
      clientConn.sendMessage(JSON.stringify({
        type: "pos",
        lat: lat,
        lng: lng
      }));
    });
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
      //console.log(err);
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
      
      if (messagesObject.type == "messages") {
        messagesObject.messages.forEach(mess => {
          if (!mess.type || !mess.data)
            return console.log("Wrong message format");
          mess.timestamp = timestamp;
          Core.getStorage().getCollection(Collection.Messages).insertOne(mess, (err, result) => {
            if (err)
              return console.log(err);
          });
        });
      }
      if (messagesObject.type == "markers") {
        messagesObject.messages.forEach(mess => {
          if (!mess.data)
            return console.log("Wrong message format");
          mess.timestamp = timestamp;
          Core.getStorage().getCollection(Collection.MapPoints).insertOne(mess, (err, result) => {
            if (err)
              return console.log(err);
          });
        });
      }
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

    try {
      let coll = Core.getStorage().getCollection(Collection.MapPoints);
      let lastMessages = await coll.find().sort({ timestamp: -1 }).limit(500).toArray();
      this.sendMessage(JSON.stringify({
        type: "markers",
        messages: lastMessages
      }));
    }
    catch (e) {
      console.log(e);
    }

    try {
      this.sendMessage(JSON.stringify({
        type: "polyline",
        messages: ClientConnection.polyline
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
