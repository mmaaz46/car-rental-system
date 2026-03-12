import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    category: 'economy',
    color: '',
    seats: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    pricePerDay: '',
    location: '',
    description: ''
  })
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      navigate('/')
      return
    }
    fetchCars()
  }, [user])

  const fetchCars = async () => {
    try {
      const response = await api.get('/cars')
      setCars(response.data.cars)
    } catch (err) {
      setError('Failed to load cars')
    }
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files))
  }

  const resetForm = () => {
    setFormData({
      make: '', model: '', year: '', licensePlate: '', category: 'economy',
      color: '', seats: '', transmission: 'automatic', fuelType: 'petrol',
      pricePerDay: '', location: '', description: ''
    })
    setImages([])
    setEditingCar(null)
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setSuccess('')

  try {
    const data = new FormData()
    
    // Map form fields to backend field names
    const fieldMapping = {
      licensePlate: 'license_plate',
      fuelType: 'fuel_type',
      pricePerDay: 'price_per_day'
    }

    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        const backendKey = fieldMapping[key] || key
        data.append(backendKey, formData[key])
      }
    })
    
    images.forEach(image => {
      data.append('images', image)
    })

    if (editingCar) {
      await api.put(`/cars/${editingCar.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Car updated successfully!')
    } else {
      await api.post('/cars', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Car added successfully!')
    }

    setShowForm(false)
    resetForm()
    fetchCars()
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to save car')
  }
}
  const handleEdit = (car) => {
    setEditingCar(car)
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.license_plate,
      category: car.category,
      color: car.color || '',
      seats: car.seats,
      transmission: car.transmission,
      fuelType: car.fuel_type,
      pricePerDay: car.price_per_day,
      location: car.location,
      description: car.description || ''
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return
    
    try {
      await api.delete(`/cars/${id}`)
      setSuccess('Car deleted successfully!')
      fetchCars()
    } catch (err) {
      setError('Failed to delete car')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Admin Dashboard</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            {showForm ? 'Cancel' : 'Add New Car'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">{success}</div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold mb-4">
              {editingCar ? 'Edit Car' : 'Add New Car'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input name="make" placeholder="Make" value={formData.make} onChange={handleChange} className="border p-2 rounded" required />
              <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="border p-2 rounded" required />
              <input name="year" type="number" placeholder="Year" value={formData.year} onChange={handleChange} className="border p-2 rounded" required />
              <input name="licensePlate" placeholder="License Plate" value={formData.licensePlate} onChange={handleChange} className="border p-2 rounded" required />
              <select name="category" value={formData.category} onChange={handleChange} className="border p-2 rounded">
                <option value="economy">Economy</option>
                <option value="compact">Compact</option>
                <option value="midsize">Midsize</option>
                <option value="luxury">Luxury</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
              </select>
              <input name="color" placeholder="Color" value={formData.color} onChange={handleChange} className="border p-2 rounded" />
              <input name="seats" type="number" placeholder="Seats" value={formData.seats} onChange={handleChange} className="border p-2 rounded" required />
              <select name="transmission" value={formData.transmission} onChange={handleChange} className="border p-2 rounded">
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border p-2 rounded">
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <input name="pricePerDay" type="number" placeholder="Price Per Day" value={formData.pricePerDay} onChange={handleChange} className="border p-2 rounded" required />
              <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="border p-2 rounded" required />
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 rounded col-span-2" rows="3"></textarea>
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">
                  Car Images {editingCar && '(Leave empty to keep existing images)'}
                </label>
                <input type="file" multiple onChange={handleImageChange} className="border p-2 rounded w-full" accept="image/*" />
              </div>
              <div className="col-span-2 flex gap-4">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  {editingCar ? 'Update Car' : 'Add Car'}
                </button>
                <button type="button" onClick={handleCancel} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cars.map((car) => (
                <tr key={car.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {car.images && car.images[0] ? (
                        <img src={`http://localhost:5000${car.images[0]}`} alt="" className="h-10 w-10 rounded-full object-cover mr-3" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-xs text-gray-500">No Img</div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{car.make} {car.model}</div>
                        <div className="text-gray-500">{car.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{car.category}</td>
                  <td className="px-6 py-4">${car.price_per_day}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(car)} className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(car.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard