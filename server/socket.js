const Chat = require('./models/Chat');  
const jwt = require('jsonwebtoken');

function setupSocketIO(io) {
  // Middleware for authenticating users using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, 'your_jwt_secret');
      socket.userId = decoded.userId;
      console.log("User authenticated and connected");
      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a room
    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Fetch chat history
    socket.on('getChatHistory', async ({ roomId }) => {
      try {
        const chatHistory = await Chat.find({ roomId }).sort({ timestamp: 1 });
        socket.emit('chatHistory', chatHistory);
        console.log(`Chat history sent to user ${socket.userId} for room ${roomId}`);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit('error', { message: 'Failed to retrieve chat history' });
      }
    });

    // Send a message
    socket.on('sendMessage', async ({ roomId, receiverId, message }) => {
      try {
        const chatMessage = new Chat({
          roomId,
          senderId: socket.userId,
          receiverId,
          message,
        });
        await chatMessage.save();
        console.log(`Message saved:`, chatMessage);

        // Broadcast the message to the room
        io.to(roomId).emit('receiveMessage', {
          senderId: socket.userId,
          receiverId,
          message,
          timestamp: chatMessage.timestamp,
        });
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

module.exports = setupSocketIO;