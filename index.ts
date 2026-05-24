import { createServer } from "http";
import initSocket from "./socket";

const port = process.env.PORT || 4000;

const server = createServer();

initSocket(server);

server.listen(port, () => {
  console.log(`> Socket server ready on http://localhost:${port}`);
});
