import { createServer } from "http";
import initSocket from "./socket.ts";

const hostname = "localhost";
const port = 3000;

const server = createServer();

initSocket(server);

server.listen(port, () => {
  console.log(`> Socket server ready on http://${hostname}:${port}`);
});
