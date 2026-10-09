import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

function App() {
  const [message, setMessage] = useState("Conectando...");

  useEffect(() => {
    const socket = io(SERVER_URL);
    socket.on("hello", (msg: string) => setMessage(msg));
    socket.on("connect_error", () => setMessage("Error de conexión"));
    return () => {
      socket.disconnect();
    };
  }, []);

  return <h1>{message}</h1>;
}

export default App;