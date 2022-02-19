import React, { useCallback, useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { useDropzone } from 'react-dropzone'

function ChatTwo({ socket,  result,total, room }) {
    const [writtenText, setWrittenText] = useState("");
    const [fileTarget, setFileTarget] = useState(null);

    socket.emit("join_room", room);

    return (
        <div className="contain">
            <div className="chat-window">
                <div className="chat-header">
                    <p>Total Result : {total}</p>
                </div>
                <div className="chat-body">
                    <ScrollToBottom className="message-container">
                        <div className="message">
                            {result.map((ele, index) => (
                                <div key={index} className="message-content mb-2">
                                    <span className="text-light">File :<b className="text-dark">{ele.name}</b> </span>
                                    <span className="mx-1 text-light" > Text: <b className="text-dark">{ele.writtenText}</b></span>
                                    <span className="text-light"> Result: <b className="text-dark">{ele.result.toFixed(3)}</b></span>
                                </div>
                            ))}

                        </div>
                    </ScrollToBottom>
                </div>      </div>
        </div>
    );
}

export default ChatTwo;
