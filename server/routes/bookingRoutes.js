import express from 'express';
import { createBooking, updateBookingStatus, getActiveBookings, estimatePrice } from '../controllers/booking.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new booking (Customer only)
router.post('/', protect, createBooking);

// Calculate estimated price
router.post('/price', protect, estimatePrice);

// Update booking status (Driver only)
router.put('/:id/status', protect, updateBookingStatus);

// Get active bookings (Customer or Driver)
router.get('/active', protect, getActiveBookings);

export default router;