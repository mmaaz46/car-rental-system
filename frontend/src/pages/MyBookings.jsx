import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import PaymentForm from '../components/PaymentForm'

function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchBookings()
  }, [user, navigate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const response = await api.get('/bookings/my-bookings')
      setBookings(response.data.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    try {
      await api.delete(`/bookings/${bookingId}`)
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled', payment_status: 'refunded' } : b)))
      setSuccess('Booking cancelled successfully')
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
      setSuccess('')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading bookings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
          My Bookings
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
            {success}
          </div>
        )}
        
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg">No bookings found.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {booking.make} {booking.model}
                    </h3>
                    <p className="text-gray-600">{booking.year}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600">Start Date</p>
                    <p className="font-semibold">
                      {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date</p>
                    <p className="font-semibold">
                      {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pickup</p>
                    <p className="font-semibold">{booking.pickup_location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dropoff</p>
                    <p className="font-semibold">{booking.dropoff_location || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t">
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      Total: ${booking.total_price || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Payment: <span className={`font-semibold ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.payment_status || 'pending'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mt-4 sm:mt-0">
                    {booking.payment_status === 'pending' && (
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowPayment(true)
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Pay Now
                      </button>
                    )}

                    {['active', 'completed'].includes(booking.status) ? null : (
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <PaymentForm 
                bookingId={selectedBooking.id}
                amount={selectedBooking.total_price}
                onSuccess={() => {
                  setShowPayment(false)
                  setSelectedBooking(null)
                  fetchBookings()
                }}
              />
              <button 
                onClick={() => {
                  setShowPayment(false)
                  setSelectedBooking(null)
                }}
                className="mt-4 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings