/**
 * Module dependencies.
 */
import express = require("express");
import compression = require("compression");  // compresses requests
import session = require("express-session");
import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import logger = require("morgan");
import errorHandler = require("errorhandler");
import dotenv = require("dotenv");
import path = require("path");
import authorization = require("express-authorization");


import passport = require("passport");
import http = require("http");

import loginDB = require("./loginDB");

import { Core } from "./core";
import { ClientConnection } from "./clientConnection";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });

Core.Init();

function pausecomp(millis) {
    let date = new Date();
    let curDate: Date = undefined;
    do { curDate = new Date(); }
    while (curDate.getTime() - date.getTime() < millis);
}

/*while (!Core.getStorage().ready) {
  yield;
}*/

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3000);
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(cookieParser());

app.use(session({
  secret: "keyboard cat",
  //cookie: { secure: true },
  resave: false,
  saveUninitialized: true
}));

console.log(path.join(__dirname, "/../src/public"));
app.use(express.static(path.join(__dirname, "/../src/public"), { maxAge: 31557600000 }));

let filesApi = require("./filesApi");

app.use("/upload", filesApi);

app.post("/pos", (req, res, next) => {
  console.log(req.body);

  ClientConnection.reportPosition(req.body.lat, req.body.lon);
  /*
  alt: "174.5"
  battery: "40"
  bearing: "298.5"
  lat: "50.05348"
  lon: "36.29443"
  speed: "0.4"
  */
  res.send("ok");
});

app.post("/login", (req, res, next) => {
  let user = {
    name: req.body.name,
    password: req.body.password
  };
  //loginDB.addUserDB(user);
  req.session.user = user;
  res.redirect("/chat.html");
  //console.log(req.body, "loginform");
});

app.post("/addmarker", (req, res, next) => {
  let marker = {
    position: req.body.position,
    description: req.body.description/* ,
    user: req.session.user.name */
  };
  console.log(marker, "addmarker");
  res.json({
    ok: true
  });
});

app.post("/removemarker", (req, res, next) => {
  let marker = {
    position: req.body.position,
    description: req.body.description/* ,
    user: req.session.user.name */
  };
  console.log(marker, "removemarker");
  res.json({
    ok: true
  });
});

app.post("/getmarkers", (req, res, next) => {
  let markersArr = [{
      position: {lat: 57.00000104209985, lng: 36.00001160055399},
      description: "fhmx",
      user: "dslg"
    },
    {
      position: {lat: 57.00000104208885, lng: 36.00001160055399},
      description: "2222",
      user: "dslg"
    },
    {
      position: {lat: 57.00000104208899, lng: 36.00001160055399},
      description: "333",
      user: "dslg"
    }
  ]
  res.json({markersArr});
});


/**
 * Error Handler. Provides full stack - remove for production
 */
app.use((req, res, next) => {
  res.status(404);
  res.json({
    ok: false
  });
});


/**
 * Start Express server.
 */
const server = http.createServer(app);

const socketApi = require("./socketApi").create(server);

server.listen(app.get("port"), () => {
  console.log(("  App is running at http://localhost:%d in %s mode"), app.get("port"), app.get("env"));
});

app.use("/api/socket", socketApi);

module.exports = app;