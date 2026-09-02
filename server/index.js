const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
      origin: "http://localhost:5173",
          credentials: true
            }
            });

            app.use(express.json());
            app.use(cookieParser());
            app.use(cors({ origin: "http://localhost:5173", credentials: true }));

            const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';
            const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatapp';

            // Database Models
            const userSchema = new mongoose.Schema({
              email: { type: String, required: true, unique: true },
                password: { type: String, required: true },
                  name: { type: String, required: true }
                  });

                  const messageSchema = new mongoose.Schema({
                    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                      receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
                        text: { type: String, required: true },
                          read: { type: Boolean, default: false },
                            createdAt: { type: Date, default: Date.now }
                            });

                            const User = mongoose.model('User', userSchema);
                            const Message = mongoose.model('Message', messageSchema);

                            // Auth Routes
                            app.post('/api/register', async (req, res) => {
                              try {
                                  const { email, password, name } = req.body;
                                      const hashedPassword = await bcrypt.hash(password, 10);
                                          const user = await User.create({ email, password: hashedPassword, name });
                                              const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET);
                                                  res.cookie('token', token, { httpOnly: true }).json({ user: { id: user._id, email: user.email, name: user.name } });
                                                    } catch (err) {
                                                        res.status(400).json({ error: 'Registration failed' });
                                                          }
                                                          });

                                                          app.post('/api/login', async (req, res) => {
                                                            try {
                                                                const { email, password } = req.body;
                                                                    const user = await User.findOne({ email });
                                                                        if (!user || !(await bcrypt.compare(password, user.password))) {
                                                                              return res.status(400).json({ error: 'Invalid credentials' });
                                                                                  }
                                                                                      const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET);
                                                                                          res.cookie('token', token, { httpOnly: true }).json({ user: { id: user._id, email: user.email, name: user.name } });
                                                                                            } catch (err) {
                                                                                                res.status(500).json({ error: 'Login failed' });
                                                                                                  }
                                                                                                  });

                                                                                                  app.post('/api/logout', (req, res) => {
                                                                                                    res.clearCookie('token').json({ message: 'Logged out' });
                                                                                                    });

                                                                                                    // Socket.IO Logic & Online Tracking
                                                                                                    const onlineUsers = new Map(); // socketId -> userId

                                                                                                    io.use((socket, next) => {
                                                                                                      const cookieHeader = socket.handshake.headers.cookie;
                                                                                                        if (!cookieHeader) return next(new Error('Authentication error'));
                                                                                                          
                                                                                                            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
                                                                                                              const token = cookies.token;
                                                                                                                
                                                                                                                  if (!token) return next(new Error('Authentication error'));
                                                                                                                    
                                                                                                                      try {
                                                                                                                          const decoded = jwt.verify(token, JWT_SECRET);
                                                                                                                              socket.userId = decoded.userId;
                                                                                                                                  socket.userName = decoded.name;
                                                                                                                                      next();
                                                                                                                                        } catch (err) {
                                                                                                                                            next(new Error('Authentication error'));
                                                                                                                                              }
                                                                                                                                              });

                                                                                                                                              io.on('connection', (socket) => {
                                                                                                                                                onlineUsers.set(socket.id, socket.userId);
                                                                                                                                                  
                                                                                                                                                    // Emit online user count to everyone
                                                                                                                                                      const uniqueOnlineCount = new Set(onlineUsers.values()).size;
                                                                                                                                                        io.emit('online:count', uniqueOnlineCount);

                                                                                                                                                          // Fetch chat history
                                                                                                                                                            socket.on('chat:history', async (otherUserId) => {
                                                                                                                                                                const messages = await Message.find({
                                                                                                                                                                      $or: [
                                                                                                                                                                              { sender: socket.userId, receiver: otherUserId },
                                                                                                                                                                                      { sender: otherUserId, receiver: socket.userId }
                                                                                                                                                                                            ]
                                                                                                                                                                                                }).sort({ createdAt: 1 });
                                                                                                                                                                                                    socket.emit('chat:history', messages);
                                                                                                                                                                                                      });

                                                                                                                                                                                                        // Send message
                                                                                                                                                                                                          socket.on('chat:send', async ({ to, text }) => {
                                                                                                                                                                                                              if (!text || !to) return;
                                                                                                                                                                                                                  const message = await Message.create({
                                                                                                                                                                                                                        sender: socket.userId,
                                                                                                                                                                                                                              receiver: to,
                                                                                                                                                                                                                                    text
                                                                                                                                                                                                                                        });

                                                                                                                                                                                                                                            // Send to sender & receiver sockets
                                                                                                                                                                                                                                                for (let [sId, uId] of onlineUsers.entries()) {
                                                                                                                                                                                                                                                      if (uId === socket.userId || uId === to) {
                                                                                                                                                                                                                                                              io.to(sId).emit('chat:message', message);
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                            // Update unread count for receiver
                                                                                                                                                                                                                                                                                const unreadCount = await Message.countDocuments({ sender: socket.userId, receiver: to, read: false });
                                                                                                                                                                                                                                                                                    for (let [sId, uId] of onlineUsers.entries()) {
                                                                                                                                                                                                                                                                                          if (uId === to) {
                                                                                                                                                                                                                                                                                                  io.to(sId).emit('chat:unread:update', { userId: socket.userId, count: unreadCount });
                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                // Fetch all unread counts
                                                                                                                                                                                                                                                                                                                  socket.on('chat:unread', async () => {
                                                                                                                                                                                                                                                                                                                      const unread = await Message.aggregate([
                                                                                                                                                                                                                                                                                                                            { $match: { receiver: new mongoose.Types.ObjectId(socket.userId), read: false } },
                                                                                                                                                                                                                                                                                                                                  { $group: { _id: "$sender", count: { $sum: 1 } } }
                                                                                                                                                                                                                                                                                                                                      ]);
                                                                                                                                                                                                                                                                                                                                          const unreadList = unread.map(u => ({ userId: u._id, count: u.count }));
                                                                                                                                                                                                                                                                                                                                              socket.emit('chat:unread', unreadList);
                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                  // Mark chat as read
                                                                                                                                                                                                                                                                                                                                                    socket.on('chat:read', async (otherUserId) => {
                                                                                                                                                                                                                                                                                                                                                        await Message.updateMany(
                                                                                                                                                                                                                                                                                                                                                              { sender: otherUserId, receiver: socket.userId, read: false },
                                                                                                                                                                                                                                                                                                                                                                    { $set: { read: true } }
                                                                                                                                                                                                                                                                                                                                                                        );
                                                                                                                                                                                                                                                                                                                                                                            socket.emit('chat:unread:update', { userId: otherUserId, count: 0 });
                                                                                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                                                                                // Typing indicator (Bonus)
                                                                                                                                                                                                                                                                                                                                                                                  socket.on('chat:typing', ({ to }) => {
                                                                                                                                                                                                                                                                                                                                                                                      for (let [sId, uId] of onlineUsers.entries()) {
                                                                                                                                                                                                                                                                                                                                                                                            if (uId === to) {
                                                                                                                                                                                                                                                                                                                                                                                                    io.to(sId).emit('chat:typing', { from: socket.userId });
                                                                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                                                                                                                                  // Handle Disconnect
                                                                                                                                                                                                                                                                                                                                                                                                                    socket.on('disconnect', () => {
                                                                                                                                                                                                                                                                                                                                                                                                                        onlineUsers.delete(socket.id);
                                                                                                                                                                                                                                                                                                                                                                                                                            const updatedCount = new Set(onlineUsers.values()).size;
                                                                                                                                                                                                                                                                                                                                                                                                                                io.emit('online:count', updatedCount);
                                                                                                                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                                                                                                                  });

                                                                                                                                                                                                                                                                                                                                                                                                                                  mongoose.connect(MONGO_URI).then(() => {
                                                                                                                                                                                                                                                                                                                                                                                                                                    server.listen(5000, () => console.log('Server running on port 5000'));
                                                                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                                                                    