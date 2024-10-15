import dotenv from 'dotenv';
dotenv.config();

import { app, httpServer } from './app.js';
import connectDB from './db/connection.js';

// Connect DB
connectDB();

try {
    httpServer.listen(process.env.PORT, () => {
        console.log(`Server listening on port ${process.env.PORT}`);
    });
} catch (err) {
    console.error("Connection error", err);
}