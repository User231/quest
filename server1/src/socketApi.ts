import ws = require("ws");
import express = require("express");
import http = require("http");
import url = require("url");
import { Core } from "./core";
import { Collection } from "./storage";

interface IChatMessage {
  timestamp: number;
  userId: number;
  type: string;
  data: string|Object;
}

interface IClientConnection {
  //userId: number;
  ws: ws;
  lastSeenOnline: number;
}

interface IUser {
  userId: number;
  name: string;
  password: string;
  sessions: string[];
}

const messagesTail = 50;

export function create(server: http.Server) {

  // router
  const router = express.Router();

  let clients: IClientConnection[] = [];

  let onClientMessage = (message: ws.Data): void => {
    try {
      let chatMessage: IChatMessage = JSON.parse(message.toString());
      if (!chatMessage.userId || !chatMessage.type || !chatMessage.data)
        return console.log("Wrong message format");
      chatMessage.timestamp = getCurrentTimestamp();
      Core.getStorage().getCollection(Collection.Messages).insertOne(chatMessage, (err, result) => {
        if (err)
          return console.log(err);
      });
    }
    catch (err) {
      console.log(err);
    }
  };

  let onClientConnected = async (client: IClientConnection) => {
    clients.push(client);
    try {
      let coll = Core.getStorage().getCollection(Collection.Messages);
      let lastMessages = await coll.find().sort({ timestamp: -1 }).limit(messagesTail).toArray();
      client.ws.send(JSON.stringify({
        type: "messages",
        messages: lastMessages
      }));
    }
    catch (e) {
      console.log(e);
    }
  }

  const wss = new ws.Server({
    server: server
  });

  wss.on("connection", (client, req) => {
    const location = url.parse(req.url, true);
    
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    client.on("message", message => {
      console.log("received: %s", message);
      onClientMessage(message);
    });

    onClientConnected({
      ws: client,
      lastSeenOnline: getCurrentTimestamp()
    });
  });

  router.get("/connect", (req, res, next) => {
    res.status(200).json({ok: true, data: "socket"});
  });

  return router;
}

function getCurrentTimestamp(): number {
  return new Date().getTime();
}