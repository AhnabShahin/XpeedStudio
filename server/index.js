import express from 'express';
import { json } from 'express';
import * as http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import * as fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';

import {
  atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt
} from 'mathjs'


const app = express();
app.use(cors());
app.use(express.json());



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const uri = `mongodb+srv://tourism:tourism@cluster0.hrcwj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const xpeedStudio_db = client.db("xpeedStudio");
    const calculationCollection = xpeedStudio_db.collection("calculation");

    io.on("connection", (socket) => {
      console.log(`User Connected: ${socket.id}`);

      socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
      });

      socket.on("send_message", (data) => {
        console.log(data)
        socket.to(data.room).emit("receive_message", data);
      });

      var queue = [];
      let queueRunning = false;
      socket.on("send_file", function (data) {

        const procesFiles = (data) => {
          return new Promise(async (resolve, reject) => {
            const promises = await data.map(async item => {

              const saveFile = async (item) => {
                return new Promise((resolve, reject) => {
                  fs.writeFile(`Files/${item.name}`, item.image, function (err) {
                    if (err === null) {
                      delete item.image;
                      item.location = `Files/${item.name}`;
                      item.result = null;
                      queue.push(item)
                      resolve(item);
                    }   
                  })
                })
              }
              return await saveFile(item); 
 
            })
            await Promise.all(promises)
            resolve(queue);
          })  
        }
        procesFiles(data)
          .then(async (q) => {
            if (!queueRunning) {
              queueRunning = true;

              const promises = q.map(async (item, index) => {
                const getFile = async (item) => {
                  return new Promise((resolve, reject) => {
                    fs.readFile('Files/' + item.name, 'utf-8', async function (err, content) {
                      item.result = evaluate(content.toString());
                      socket.broadcast.to('calculation').emit("result", item);
                      socket.emit("result", item);
                      // console.log(item)
                      queue.splice(0, 1);
                      calculationCollection.insertOne(item); 
                      resolve(item);
                    })
                  })
                }
                return await getFile(item)
              })
              await Promise.all(promises);
              queueRunning = false;
 
            }
          }) 
      });

      socket.on("getAllResult", async function (data) { 
        const items = await calculationCollection.find().toArray();
       
        console.log(items)
        socket.emit("sendAllResult",items);
      }); 
  
      socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
      });

    });

  }
  finally {
    // client.close();
  }
}
run().catch(console.dir)


server.listen(3002, () => {
  console.log("SERVER RUNNING");
});
