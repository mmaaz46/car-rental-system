import Stripe from 'stripe';
import { query } from '../config/database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here');

export const paymentController = {
  // Create payment intent
  async createPaymentIntent(req, res) {
    try {
      const { bookingId } = req.body;
      const userId = req.user.id;

      // Get booking details
      const bookingResult = await query(
        'SELECT b.*, c.make, c.model FROM bookings b JOIN cars c ON b.car_id = c.id WHERE b.id = $1 AND b.user_id = $2',
        [bookingId, userId]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      }

      const booking = bookingResult.rows[0];

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.total_price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingId: booking.id,
          userId: userId
        }
      });

      res.json({
        status: 'success',
        clientSecret: paymentIntent.client_secret,
        amount: booking.total_price
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  // Confirm payment (webhook)
  async confirmPayment(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle payment success
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      // Update booking payment status
      await query(
        'UPDATE bookings SET payment_status = $1, status = $2 WHERE id = $3',
        ['paid', 'confirmed', bookingId]
      );

      // Create payment record
      await query(
        'INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status, paid_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [bookingId, paymentIntent.amount / 100, 'credit_card', paymentIntent.id, 'completed']
      );
    }

    res.json({ received: true });
  }
};