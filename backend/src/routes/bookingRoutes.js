import express from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /api/bookings - Create booking
router.post('/', bookingController.createBooking);

// GET /api/bookings/my-bookings - Get user's bookings
router.get('/my-bookings', bookingController.getMyBookings);

// DELETE /api/bookings/:id - Cancel/delete a booking (owner only)
router.delete('/:id', bookingController.deleteBooking);

export default router;