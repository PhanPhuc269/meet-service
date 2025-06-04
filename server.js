const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Simple in-memory room management
const rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
    const { type, room, payload } = data;
    switch (type) {
      case 'join':
        if (!rooms[room]) rooms[room] = [];
        rooms[room].push(ws);
        ws.room = room;
        ws.send(JSON.stringify({ type: 'joined', room }));
        break;
      case 'signal':
        // Broadcast signaling data to all peers in the room except sender
        if (rooms[room]) {
          rooms[room].forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'signal', payload }));
            }
          });
        }
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  });

  ws.on('close', () => {
    const room = ws.room;
    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter(client => client !== ws);
      if (rooms[room].length === 0) delete rooms[room];
    }
  });
});

const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
