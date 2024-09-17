const videoGrid = document.getElementById("video_grid");
const peers = {};
const myPeer = new Peer(undefined, {
  secure: true,
  host: "0.peerjs.com",
  port: 443, // HTTPS için genelde 443 kullanılır
  path: "/",
});

const socket = io("192.168.2.7:3000"); // Adjust if necessary

const myVideo = document.createElement("video");
myVideo.muted = true;

myPeer.on("open", (id) => {
  socket.emit("join-room", room_id, id);
});

console.log("servıra ulaşabiliyorum"); //// important
navigator.mediaDevices
  .getUserMedia({
    video: { facingMode: "user" },
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      peers[call.peer] = call;
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });

      call.on("close", () => {
        console.log("Call closed");
        video.remove();
      });

      call.on("error", (err) => {
        console.error(`Call error with ${call.peer}:`, err);
      });
    });

    socket.on("user_connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    socket.on("user_disconnected", (userId) => {
      if (peers[userId]) {
        peers[userId].close();
        delete peers[userId];
      }
    });
  })
  .catch((error) => {
    console.error("Error accessing camera or microphone:", error);
  });

function connectToNewUser(userId, stream) {
  try {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    peers[userId] = call;
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
      console.log("User disconnected from new user section");
      video.remove();
    });

    call.on("error", (err) => {
      console.error(`Error with call to ${userId}:`, err);
    });
  } catch (err) {
    console.error(`Error connecting to user ${userId}:`, err);
  }
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
