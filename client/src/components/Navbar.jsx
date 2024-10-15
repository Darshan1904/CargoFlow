import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`block py-2 px-4 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg ${
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-indigo-500 hover:text-white'
        }`}
        onClick={() => setIsOpen(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {userType === 'customer' && (
                  <>
                    <NavLink to="/customer-dashboard">Dashboard</NavLink>
                    <NavLink to="/booking">Book a Ride</NavLink>
                  </>
                )}
                {userType === 'driver' && (
                  <NavLink to="/driver-dashboard">Dashboard</NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {userType === 'customer' && (
              <>
                <NavLink to="/customer-dashboard">Dashboard</NavLink>
                <NavLink to="/booking">Book a Ride</NavLink>
              </>
            )}
            {userType === 'driver' && (
              <NavLink to="/driver-dashboard">Dashboard</NavLink>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left text-black hover:bg-red-600 hover:text-white px-3 py-2 rounded-md text-base font-medium transition duration-200"
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
