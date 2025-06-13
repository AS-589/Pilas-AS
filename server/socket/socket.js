const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'https://pilas-as.vercel.app'];

console.log('Socket.IO Allowed Origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log('Socket.IO Request Origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

const userSocketMap = {};

const getReceiverSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const userId = socket.handshake.query.userId;

  if (userId !== 'undefined') userSocketMap[userId] = socket.id;
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

module.exports = { io, server, app, getReceiverSocketId };
