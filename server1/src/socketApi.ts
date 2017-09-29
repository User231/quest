import ws = require("ws");
import express = require("express");
import http = require("http");
import url = require("url");
import { Core } from "./core";
import { Collection } from "./storage";
import { ClientConnection } from "./clientConnection";


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


  const wss = new ws.Server({
    server: server
  });

  wss.on("connection", (client, req) => {
    ClientConnection.registerClient(client);
  });

  router.get("/connect", (req, res, next) => {
    res.status(200).json({ok: true, data: "socket"});
  });

  ClientConnection.Init();
  
  return router;
}
