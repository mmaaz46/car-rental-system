import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import CarSearch from '../components/CarSearch'

function Home() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({})

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async (searchFilters = {}) => {
  try {
    setLoading(true)
    const params = new URLSearchParams()
    Object.keys(searchFilters).forEach(key => {
      if (searchFilters[key]) params.append(key, searchFilters[key])
    })
    
    const queryString = params.toString()
    const url = queryString ? `/cars?${queryString}` : '/cars'
    
    const response = await api.get(url)
    setCars(response.data.cars)
  } catch (error) {
    console.error('Error fetching cars:', error)
    setError('Failed to load cars')
  } finally {
    setLoading(false)
  }
}

const handleSearch = (searchFilters) => {
  setFilters(searchFilters)
  fetchCars(searchFilters)
}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold">Loading cars...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          Available Cars
        </h1>

        <CarSearch onSearch={handleSearch} />

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
             
              {/* Car Image */}
              
             <div className="h-48 bg-gray-200 overflow-hidden">
  {car.images && car.images.length > 0 ? (
    <img 
      src={`http://localhost:5000${car.images[0]}`}
      alt={`${car.make} ${car.model}`}
      className="w-full h-full object-cover"
      crossOrigin="anonymous"
    />
  ) : (
    <div className="h-full flex items-center justify-center text-gray-500">
      No Image
    </div>
  )}
</div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {car.make} {car.model}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                    {car.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-1">{car.year} • {car.transmission} • {car.fuel_type}</p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {car.location}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {car.seats} seats
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">${car.price_per_day}</span>
                    <span className="text-gray-500">/day</span>
                  </div>
                  <Link 
                    to={`/booking/${car.id}`}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home