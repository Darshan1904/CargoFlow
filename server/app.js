import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from './routes/auth.js';
import bookingRouter from './routes/bookingRoutes.js';
import setupSocket from './socket.js';
import mapRoute from './routes/mapRoutes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// setup socket
setupSocket(io);

app.use(cors());
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));

//auth routes
app.use('/auth', authRouter);

//booking routes
app.use('/api/bookings', bookingRouter);

//map routes
app.use('api/geocode', mapRoute);

export {app, httpServer};