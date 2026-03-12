import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../services/api'

const stripePromise = loadStripe('pk_test_your_publishable_key_here')

const CheckoutForm = ({ bookingId, amount, onSuccess }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      // Create payment intent
      const { data } = await api.post('/payments/create-intent', { bookingId })
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Customer Name',
          },
        },
      })

      if (result.error) {
        setError(result.error.message)
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          alert('Payment successful!')
          onSuccess()
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded border">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>
      
      {error && <div className="text-red-600">{error}</div>}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  )
}

function PaymentForm({ bookingId, amount, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
        <p className="mb-4 text-gray-600">Amount: <span className="font-bold text-green-600">${amount}</span></p>
        <CheckoutForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
      </div>
    </Elements>
  )
}

export default PaymentForm