import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create payment intent
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);

// Webhook (no auth needed, Stripe calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.confirmPayment);

export default router;