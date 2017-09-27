import * as ws from "ws";

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
  }

  public sendMessage(message: string): void {
    this.socket.send(message);
  }

  protected messageReceived(message: any): void {
    ClientConnection.clients.forEach(clientConn => {
      console.log(this);
      if (clientConn != this)
        clientConn.sendMessage(message);
    });
  }
}
