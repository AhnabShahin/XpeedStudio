import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import Chat from "./Chat";
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import ChatTwo from "./ChatTwo";

const socket = io.connect("http://localhost:3002");

function App() {
  const [result, setResult] = useState([]);
  const [room, setRoom] = useState("calculation");
  const [process, setProcess] = useState(false);

  useEffect(()=>{
    
    socket.emit("getAllResult",'get');
    socket.on("sendAllResult", function (data) {
      setResult(data);
    })
    
    socket.on("result", function (data) {
      setResult((list) => [...list, data]);
      setProcess(false)
    });
  },[])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Chat socket={socket} result={result} setProcess={setProcess} process={process} room={room} />}></Route>
          <Route path="/screen-b" element={<ChatTwo socket={socket} result={result}  room={room} />}></Route>
        </Routes>
      </Router>
    </>
  ); 
}

export default App;
