import express from 'express';
import { createBooking, updateBookingStatus, getActiveBookings, estimatePrice, getNearbyBookings, getPastBookings, getCurrentBooking, acceptBooking } from '../controllers/booking.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new booking
router.post('/', protect, createBooking);

// Calculate estimated price
router.post('/price', protect, estimatePrice);

// Update booking status 
router.put('/:id/status', protect, updateBookingStatus);

// Get active bookings 
router.get('/active', protect, getActiveBookings);

// Get nearby bookings 
router.get('/nearby', protect, getNearbyBookings);

// Accept a booking
router.put('/:id/accept', protect, acceptBooking);

// Get past bookings 
router.get('/past', protect, getPastBookings);

// Get current booking 
router.get('/current', protect, getCurrentBooking);

export default router;