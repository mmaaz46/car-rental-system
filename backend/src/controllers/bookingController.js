import { query } from '../config/database.js';
import { emailService } from '../services/emailService.js';
export const bookingController = {
  // Create new booking
  async createBooking(req, res) {
    try {
      const { carId, startDate, endDate, pickupLocation, dropoffLocation } = req.body;
      const userId = req.user.id; // From auth middleware

      // Validate payload
      if (!carId || !startDate || !endDate || !pickupLocation || !dropoffLocation) {
        return res.status(400).json({ status: 'error', message: 'All booking fields are required.' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({ status: 'error', message: 'Invalid dates provided.' });
      }

      if (end < start) {
        return res.status(400).json({ status: 'error', message: 'End date must be on or after start date.' });
      }

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days <= 0) {
        return res.status(400).json({ status: 'error', message: 'Booking must be at least one day.' });
      }

      // Check if car exists and is available
      const carResult = await query('SELECT * FROM cars WHERE id = $1 AND status = $2', [carId, 'available']);
      if (carResult.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Car not available' });
      }

      const car = carResult.rows[0];

      // Calculate total price
      const totalPrice = days * car.price_per_day;

      // Create booking
      const result = await query(
        `INSERT INTO bookings (user_id, car_id, start_date, end_date, pickup_location, dropoff_location, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [userId, carId, startDate, endDate, pickupLocation, dropoffLocation, totalPrice, 'pending']
      );

      res.status(201).json({
        status: 'success',
        message: 'Booking created successfully',
        booking: result.rows[0]
      });

      // After creating booking, send email
const userResult = await query('SELECT email, first_name FROM users WHERE id = $1', [userId]);
const user = userResult.rows[0];

await emailService.sendBookingConfirmation(
  user.email,
  user.first_name,
  {
    make: car.make,
    model: car.model,
    startDate: startDate,
    endDate: endDate,
    pickupLocation: pickupLocation,
    totalPrice: totalPrice
  }
);
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  

  // Get user's bookings
  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await query(
        `SELECT b.*, c.make, c.model, c.year, c.images 
         FROM bookings b 
         JOIN cars c ON b.car_id = c.id 
         WHERE b.user_id = $1 
         ORDER BY b.created_at DESC`,
        [userId]
      );

      res.json({
        status: 'success',
        count: result.rowCount,
        bookings: result.rows
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Delete a booking (only the owner can delete)
  async deleteBooking(req, res) {
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;

      const result = await query(
        'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
        [bookingId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      }

      const booking = result.rows[0];
      if (['active', 'completed'].includes(booking.status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot cancel active or completed bookings'
        });
      }

      // Soft-cancel the booking to preserve history
      await query(
        'UPDATE bookings SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['cancelled', 'refunded', bookingId]
      );

      res.json({ status: 'success', message: 'Booking cancelled successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};