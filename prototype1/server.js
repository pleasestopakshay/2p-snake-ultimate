const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// Game state management
let gameRooms = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a game room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    if (!gameRooms[roomId]) {
      gameRooms[roomId] = {
        players: {},
        gameState: null,
        settings: {
          gridSize: 20,
          speed: 150,
          foodCount: 1,
          walls: true
        }
      };
    }
    
    gameRooms[roomId].players[socket.id] = {
      id: socket.id,
      snake: [],
      score: 0,
      alive: true
    };
    
    io.to(roomId).emit('playerJoined', gameRooms[roomId].players);
  });

  // Update game settings
  socket.on('updateSettings', (roomId, settings) => {
    if (gameRooms[roomId]) {
      gameRooms[roomId].settings = { ...gameRooms[roomId].settings, ...settings };
      io.to(roomId).emit('settingsUpdated', gameRooms[roomId].settings);
    }
  });

  // Handle game moves
  socket.on('gameMove', (roomId, direction) => {
    if (gameRooms[roomId] && gameRooms[roomId].players[socket.id]) {
      // Update player direction
      gameRooms[roomId].players[socket.id].direction = direction;
      io.to(roomId).emit('gameUpdate', gameRooms[roomId]);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove player from all rooms
    Object.keys(gameRooms).forEach(roomId => {
      if (gameRooms[roomId].players[socket.id]) {
        delete gameRooms[roomId].players[socket.id];
        io.to(roomId).emit('playerLeft', gameRooms[roomId].players);
      }
    });
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
