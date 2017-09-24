import ws = require("ws");
import express = require("express");
import http = require("http");
import url = require("url");
import mongodb = require("mongodb");

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

interface IUsersConnection {
  //userId: number;
  ws: ws;
  lastSeenOnline: number;
}

const messagesTail = 50;

export function create(server: http.Server) {

  // router
  const router = express.Router();

  // db
  let db: mongodb.Db = undefined;
  let messagesCollection: mongodb.Collection = undefined;
  let routesCollection: mongodb.Collection = undefined;
  let placesCollection: mongodb.Collection = undefined;
  let usersCollection: mongodb.Collection = undefined;

  // 
  let clients: IClientConnection[] = [];

  let onClientMessage = (message: ws.Data): void => {
    try {
      let chatMessage: IChatMessage = JSON.parse(message.toString());
      if (!chatMessage.userId || !chatMessage.type || !chatMessage.data)
        return console.log("Wrong message format");
      chatMessage.timestamp = getCurrentTimestamp();
      messagesCollection.insertOne(chatMessage, (err, result) => {
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
      let lastMessages = await messagesCollection.find().sort({ timestamp: -1 }).limit(messagesTail).toArray();
      client.ws.send(JSON.stringify({
        type: "messages",
        messages: lastMessages
      }));
    }
    catch (e) {
      console.log(e);
    }
  }

  mongodb.MongoClient.connect(process.env.MONGODB_URI, (err, res) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    db = res;
    messagesCollection = db.collection("messages");
    routesCollection = db.collection("routes");
    routesCollection = db.collection("places");
  });

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