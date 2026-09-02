const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookie = require('cookie');
require('dotenv').config();

const User = require('./models/User');
const Message = require('./models/Message');
const verifyToken = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));


app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/me', verifyToken, (req, res) => {
  res.json(req.user);
});

app.get('/api/users', verifyToken, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
  res.json(users);
});


const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});


const onlineUsers = new Map();

io.use((socket, next) => {
  const reqCookies = socket.handshake.headers.cookie;
  if (!reqCookies) return next(new Error('Authentication error'));
  
  const parsedCookies = cookie.parse(reqCookies);
  const token = parsedCookies.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.user.id;

  
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  
  io.emit('online:count', onlineUsers.size);
  io.emit('online:users', Array.from(onlineUsers.keys()));

  
  socket.on('chat:history', async (otherUserId) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      }).sort({ createdAt: 1 });
      socket.emit('chat:history', messages);
    } catch (err) {
      console.error(err);
    }
  });

  
  socket.on('chat:send', async ({ to, text }) => {
    try {
      if (!to || !text.trim()) return;
      const message = await Message.create({
        sender: userId,
        receiver: to,
        text
      });

      
      const senderSockets = onlineUsers.get(userId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('chat:message', message));
      }

      
      const receiverSockets = onlineUsers.get(to);
      if (receiverSockets) {
        receiverSockets.forEach(sId => io.to(sId).emit('chat:message', message));

        
        const unreadCount = await Message.countDocuments({ sender: userId, receiver: to, read: false });
        receiverSockets.forEach(sId => io.to(sId).emit('chat:unread:update', { userId: userId, count: unreadCount }));
      }
    } catch (err) {
      console.error(err);
    }
  });

  
  socket.on('chat:unread', async () => {
    try {
      const unread = await Message.aggregate([
        { $match: { receiver: new mongoose.Types.ObjectId(userId), read: false } },
        { $group: { _id: '$sender', count: { $sum: 1 } } }
      ]);
      
      const unreadList = unread.map(u => ({ userId: u._id.toString(), count: u.count }));
      socket.emit('chat:unread', unreadList);
    } catch (err) {
      console.error(err);
    }
  });

  
  socket.on('chat:read', async (otherUserId) => {
    try {
      await Message.updateMany(
        { sender: otherUserId, receiver: userId, read: false },
        { $set: { read: true } }
      );
      
      socket.emit('chat:unread:update', { userId: otherUserId, count: 0 });
    } catch (err) {
      console.error(err);
    }
  });

  
  socket.on('chat:typing', ({ to }) => {
    const receiverSockets = onlineUsers.get(to);
    if (receiverSockets) {
      receiverSockets.forEach(sId => io.to(sId).emit('chat:typing', { from: userId }));
    }
  });

  
  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit('online:count', onlineUsers.size);
    io.emit('online:users', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
