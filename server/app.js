import expresss from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import bookingRouter from './routes/bookingRoutes.js';

const app = expresss();

app.use(cors());
app.use(expresss.json({limit: "16kb"}));
app.use(expresss.urlencoded({extended: true, limit: "16kb"}));
app.use(expresss.static("public"));

//auth routes
app.use('/auth', authRouter);

//booking routes
app.use('/api/bookings', bookingRouter);

export default app;