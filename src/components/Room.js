import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import "../styles/room.css";

const Video = (props) => {
  const videoRef = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      videoRef.current.srcObject = stream;
    });
  }, []);
  
  return <video className="video" muted playsInline autoPlay ref={videoRef} />;
};

const Room = (props) => {
  const [mic, setMic] = useState(false);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomId = props.match.params.roomId;

  useEffect(() => {
    socketRef.current = io.connect("https://video-chat-app-backend-webrtc.herokuapp.com/");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        socketRef.current.emit("joinedRoom", roomId);
        socketRef.current.on("users", (users) => {
          const peers = [];
          users.forEach((userId) => {
            const peer = createPeer(userId, socketRef.current.id, stream);
            peersRef.current.push({
              peerId: userId,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("userJoined", (data) => {
          const peer = addPeer(data.signal, data.callerId, stream);
          peersRef.current.push({
            peerId: data.callerId,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receivedReturnedSignal", (data) => {
          const item = peersRef.current.find((p) => p.peerId === data.id);
          item.peer.signal(data.signal);
        });
      });
  }, []);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sendingSignals", {
        userToSignal,
        callerId,
        signal,
      });
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returningSignal", {
        callerId: callerId,
        signal,
      });
    });

    peer.signal(incomingSignal);

    return peer;
  };

  return (
    <>
      <div className="videos">
        <video
          className="video myvideo"
          muted={mic ? false : true}
          ref={userVideo}
          autoPlay
          playsInline
        />
        {peers.map((peer, index) => {
          return <Video key={index} peer={peer} />;
        })}
      </div>

      <div className="controls">
        <button
          className="btn rounded-circle"
          style={{ backgroundColor: "#363B45" }}
          value={mic}
          onClick={() => setMic(!mic)}
        >
          {mic ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="40"
              fill="#08D9D6"
              style={{ backgroundColor: "#363B45" }}
              className="bi bi-mic-fill"
              viewBox="0 0 16 16"
            >
              <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z" />
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="40"
              fill="#08D9D6"
              style={{ backgroundColor: "#363B45" }}
              className="bi bi-mic-mute-fill"
              viewBox="0 0 16 16"
            >
              <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z" />
              <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z" />
            </svg>
          )}
        </button>
        <button
          style={{ backgroundColor: "#FF2E63", color: "#252A34" }}
          className="btn ms-3"
          onClick={() => {
            window.open("", "_self");
            window.close();
            window.close();
          }}
        >
          End Call
        </button>
      </div>
    </>
  );
};

export default Room;
