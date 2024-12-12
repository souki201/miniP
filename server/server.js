// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const http = require('http'); // For creating the server
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User'); // User model
const Socket = require('socket.io');
const setupSocketIO = require('./socket');
const app = express();
const server = http.createServer(app); 
const jwt = require('jsonwebtoken');
const Chat = require('./models/Chat');
const axios = require('axios')
const io = new Socket.Server(server, {
    cors: {
      origin: "*", // Allow connections from any origin
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

setupSocketIO(io)


const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret'; // Replace this with a stronger secret in production

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['*'] }));

// Connect to MongoDB
mongoose.connect('mongodb+srv://mini:mini@cluster0.qqnpd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB:', err));

// Register route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password , expoPushToken } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.expoPushToken = expoPushToken;
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: token , userId: user._id });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error });
  }
});

// Protected route (Example: Get user info)
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});
// Update user profile (email, password, and image)
app.put('/profile', verifyToken, async (req, res) => {
  const { email, password, img } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields only if provided
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10); // Hash the new password
    if (img) user.img = img;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating profile', error });
  }
});
app.post('/sendPushNotification', async (req, res) => {
  const { expoPushToken, title, message } = req.body;

  if (!expoPushToken || !title || !message) {
    return res.status(400).json({ error: 'expoPushToken, title, and message are required' });
  }

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      title: title,
      body: message,
      sound: 'default', // Optional: can be 'default' or custom sound
      data: { additionalData: 'some data' }, // Optional: custom data to send with the push
    });

    // Send success response
    res.status(200).json({ success: true, response: response.data });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Error sending push notification', details: error.response.data });
  }
});
app.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  });
  
  // Get messages for a room
  app.get('/messages/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
      const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching messages', error });
    }
  });
    // Get messages for a room
    app.get('/messages', async (req, res) => {
      
      try {
        const messages = await Chat.find();
        res.json(messages);
      } catch (error) {
        console
        res.status(500).json({ message: 'Error fetching messages', error });
      }
    });
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

















