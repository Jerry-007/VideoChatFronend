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

  return <video className="video" playsInline autoPlay ref={videoRef} />;
};

const Room = (props) => {
  console.log(props);
  const [toggleAudio, setToggleAudio] = useState(true);
  const [toggleVideo, setToggleVideo] = useState(true);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomId = props.match.params.roomId;

  useEffect(() => {
    socketRef.current = io.connect(
      "https://video-chat-app-backend-webrtc.herokuapp.com/"
    );
    // socketRef.current = io.connect("http://localhost:8000/");

    navigator.mediaDevices
      .getUserMedia({ video: toggleVideo, audio: true })
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

            peers.push({
              peer,
              peerId: userId,
            });
          });

          setPeers(peers);
        });

        socketRef.current.on("userJoined", (data) => {
          const peer = addPeer(data.signal, data.callerId, stream);
          peersRef.current.push({
            peerId: data.callerId,
            peer,
          });

          const peerObj = {
            peer,
            peerId: data.callerId,
          };

          setPeers((users) => [...users, peerObj]);
        });

        socketRef.current.on("receivedReturnedSignal", (data) => {
          const item = peersRef.current.find((p) => p.peerId === data.id);
          item.peer.signal(data.signal);
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerId === id);
          if (peerObj) {
            peerObj.peer.destroy();
          }

          const peers = peersRef.current.filter((p) => p.peerId !== id);
          peersRef.current = peers;
          setPeers(peers);
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
          ref={userVideo}
          autoPlay
          playsInline
          muted
        />
        {peers.map((peer) => {
          return <Video key={peer.peerId} peer={peer.peer} />;
        })}
      </div>

      <div className="controls">
        <button
          className="btn rounded-circle"
          style={{ backgroundColor: "#363B45" }}
          value={toggleAudio}
          onClick={() => {
            userVideo.current.srcObject.getAudioTracks()[0].enabled =
              !toggleAudio;
            //userVideo.current.srcObject.getAudioTracks()[0].stop();
            setToggleAudio(!toggleAudio);
          }}
        >
          {toggleAudio ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="27"
              height="45"
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
              width="27"
              height="45"
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
          className="btn rounded-circle"
          style={{ backgroundColor: "#363B45" }}
          value={toggleVideo}
          onClick={() => {
            userVideo.current.srcObject.getVideoTracks()[0].enabled =
              !toggleVideo;
            //userVideo.current.srcObject.getVideoTracks()[0].stop();
            setToggleVideo(!toggleVideo);
          }}
        >
          {toggleVideo ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="27"
              height="45"
              fill="#08D9D6"
              style={{ backgroundColor: "#363B45" }}
              className="bi bi-camera-video-fill"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"
              />
            </svg>
          ) : (
            <svg
              width="27"
              height="45"
              fill="#08D9D6"
              style={{ backgroundColor: "#363B45" }}
              className="bi bi-camera-video-off-fill"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"
              />
            </svg>
          )}
        </button>
        <button
          style={{ backgroundColor: "#FF2E63", color: "#252A34" }}
          className="btn ms-3"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          End Call
        </button>
        <button
          style={{ backgroundColor: "#FF2E63", color: "#252A34" }}
          className="btn ms-3"
          onClick={() => {
            navigator.clipboard.writeText(props.match.params.roomId);
            alert("Room id copied to clipboard");
          }}
        >
          Copy Room Id
        </button>
      </div>
    </>
  );
};

export default Room;
