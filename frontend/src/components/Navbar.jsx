import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200">
          Car Rental
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          
          {user ? (
            <>
              <Link to="/my-bookings" className="hover:text-blue-200">
                My Bookings
              </Link>
              
              {/* Show Admin link only for admins */}
              {(user.role === 'admin' || user.role === 'manager') && (
                <Link to="/admin" className="hover:text-blue-200 text-yellow-300">
                  Admin
                </Link>
              )}
              
              <span className="text-blue-200">
                Welcome, {user.firstName}!
              </span>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Login</Link>
              <Link to="/register" className="hover:text-blue-200">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar