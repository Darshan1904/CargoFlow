import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './db/connection.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Connect DB
connectDB();

// Create an HTTP server
const server = createServer(app);

// Integrate Socket.IO with the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
});

try {
    server.listen(process.env.PORT, () => {
        console.log(`Server listening on port ${process.env.PORT}`);
    });
} catch (err) {
    console.error("Connection error", err);
}
