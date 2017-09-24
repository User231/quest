/**
 * Module dependencies.
 */
import express = require("express");
import compression = require("compression");  // compresses requests
import session = require("express-session");
import bodyParser = require("body-parser");
import logger = require("morgan");
import errorHandler = require("errorhandler");
import dotenv = require("dotenv");
import path = require("path");
import authorization = require('express-authorization');


import passport = require("passport");
import websocket = require("websocket");
import http = require("http");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env.example" });

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

console.log(path.join(__dirname, "/../src/public"));
app.use(express.static(path.join(__dirname, "/../src/public"), { maxAge: 31557600000 }));



/* app.use("/cycle", (req, res, next) => {
  console.log(req.originalUrl.substr(7, 5));
  res.redirect("https://tile.thunderforest.com" + req.originalUrl);
  //res.status(200);
  //res.json({ok: true});
}); */


/**
 * OAuth authentication routes. (Sign in)
 */
app.get("/login", (req, res, next) => {
  res.status(200);
  res.json({ok: true});
});

/* app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(req.session.returnTo || "/");
}); */

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