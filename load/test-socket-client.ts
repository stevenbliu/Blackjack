import { io } from "socket.io-client";

const socket = io("http://localhost:8000/chat", {
  transports: ["websocket"],
  upgrade: false,
  auth: {
    token: "test-token",
    username: "user1",
    user_id: "user1"
  }
});

socket.on("connect", () => {
  console.log("✅ Connected to /chat");

  socket.emit("test_message", {
    room_id: "123",
    message: "Hello from client"
  }, (response: any) => {    // <---- here
    console.log("📩 Got response:", response);
    socket.disconnect();
  });
});

socket.on("connect_error", (err) => {
  console.error("❌ Connect error:", err.message);
});
