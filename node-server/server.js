const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from 'templates' directory
app.use(express.static(path.join(__dirname, 'templates')));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Array of heart emojis
const HEARTS = ['❤️', '💖', '💝', '💗', '💓', '💕', '💞', '💘', '💟'];

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    let heartbeatInterval;
    let lastHeartbeat = 0;
    const HEARTBEAT_INTERVAL = 10000; // 10 seconds
    
    // Start sending heartbeats
    heartbeatInterval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL) {
            const heart = HEARTS[Math.floor(Math.random() * HEARTS.length)];
            const timestamp = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            ws.send(`${heart} ${timestamp}`);
            lastHeartbeat = currentTime;
        }
    }, 1000);
    
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(heartbeatInterval);
    });
    
    // Handle connection errors
    ws.on('error', console.error);
});

// Start the server
const PORT = process.env.PORT || 9876;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
