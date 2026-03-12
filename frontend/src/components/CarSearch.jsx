import { useState } from 'react'

function CarSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  })

  const handleChange = (e) => {
    setFilters({...filters, [e.target.name]: e.target.value})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(filters)
  }

  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: ''
    })
    onSearch({})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by name */}
          <div>
            <label className="block text-gray-700 mb-1">Search</label>
            <input
              type="text"
              name="search"
              placeholder="Toyota, BMW..."
              value={filters.search}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">All Categories</option>
              <option value="economy">Economy</option>
              <option value="compact">Compact</option>
              <option value="midsize">Midsize</option>
              <option value="luxury">Luxury</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="New York, LA..."
              value={filters.location}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-gray-700 mb-1">Min Price ($)</label>
            <input
              type="number"
              name="minPrice"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-gray-700 mb-1">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CarSearch