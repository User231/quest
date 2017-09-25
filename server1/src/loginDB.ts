import express = require("express");
import http = require("http");
import url = require("url");
import mongodb = require("mongodb");

interface IUser {
  name: string;
  password: string;
}

export default async function (userData: IUser) {
  let db: mongodb.Db = undefined;
  let usersCollection: mongodb.Collection = undefined;

  mongodb.MongoClient.connect(process.env.MONGODB_URI, (err, res) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    db = res;
    usersCollection = db.collection("users");
  });
  
  let user = await usersCollection.find().filter({name: userData.name, password: userData.password});
  if (user) {
    return true;
  }
  else {
    await usersCollection.insertOne(userData, (err, result) => {
      if (err)
          return console.log(err);
    });
    return true;
  }  
}
