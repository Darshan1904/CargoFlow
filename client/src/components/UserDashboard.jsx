import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';

const UserDashboard = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const activeResponse = await axios.get('/api/bookings/active', {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      setActiveBookings(activeResponse.data);

      const pastResponse = await axios.get('/api/bookings/past', {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      setPastBookings(pastResponse.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const renderBookingList = (bookings, title) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {bookings.map((booking) => (
            <li key={booking._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{new Date(booking.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{`From: ${booking.pickupAddress}`}</p>
                  <p className="text-sm text-gray-500">{`To: ${booking.dropoffAddress}`}</p>
                  <p className="text-sm text-gray-500">Vehicle: {booking.vehicleType}</p>
                  <p className="text-sm text-gray-500">Price: ₹{booking.price.toFixed(2)}</p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <Link
        to="/booking"
        className="mb-6 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Book a Vehicle
      </Link>
      
      {renderBookingList(activeBookings, "Active Bookings")}
      {renderBookingList(pastBookings, "Past Bookings")}
    </div>
  );
};

export default UserDashboard;