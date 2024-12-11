
const Chat = require('./models/Chat');  

function setupSocketIO(io) {

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a room
    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Leave a room
    socket.on('leaveRoom', ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ roomId, message }) => {
      const chatMessage = new Chat({
        roomId,
        userId: socket.userId,
        message,
        timestamp: new Date(),
      });
      await chatMessage.save();

      io.to(roomId).emit('receiveMessage', {
        userId: socket.userId,
        message,
        timestamp: chatMessage.timestamp,
      });
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

module.exports = setupSocketIO;
