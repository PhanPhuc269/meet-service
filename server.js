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

const { v4: uuidv4 } = require('uuid');

wss.on('connection', (ws) => {
  ws.id = uuidv4();
  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }
    const { type, room, payload, to } = data;
    switch (type) {
      case 'join':
        if (!rooms[room]) rooms[room] = [];
        ws.room = room;
        rooms[room].push(ws);
        // Gửi danh sách peerId hiện tại cho peer mới
        const peerIds = rooms[room].filter(client => client !== ws).map(client => client.id);
        ws.send(JSON.stringify({ type: 'joined', room, id: ws.id, peers: peerIds }));
        // Thông báo cho các peer cũ về peer mới
        rooms[room].forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'new-peer', id: ws.id }));
          }
        });
        break;
      case 'signal':
        // Chỉ gửi signaling tới peer đích
        if (rooms[room]) {
          const target = rooms[room].find(client => client.id === to);
          if (target && target.readyState === WebSocket.OPEN) {
            target.send(JSON.stringify({ type: 'signal', from: ws.id, payload }));
          }
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
      // Thông báo cho các peer còn lại về peer rời phòng
      rooms[room].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'peer-left', id: ws.id }));
        }
      });
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
