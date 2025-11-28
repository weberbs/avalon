const { createServer } = require("http");
const io = require("./src/server/socketServer").default;

const httpServer = createServer();
io.attach(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});