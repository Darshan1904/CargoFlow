import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import io from 'socket.io-client';
import OpenRouteMap from './OpenRouteMap';

const UserDashboard = () => {
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  // setup socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  // keep track of driver location update
  useEffect(() => {
    if (socket && trackingBooking) {
      socket.emit('join-booking-room', trackingBooking._id);
      socket.on('driver-location-updated', (location) => {
        setDriverLocation({
          longitude: location.coordinates[0],
          latitude: location.coordinates[1]
        });
      });

      return () => {
        socket.off('driver-location-updated');
        socket.emit('leave-booking-room', trackingBooking._id);
      };
    }
  }, [socket, trackingBooking]);


  // Fetch data function
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

  const handleTrackDriver = (booking) => {
    setTrackingBooking(booking);
    setDriverLocation(null); // Reset driver location when switching to a new booking
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
                  <p className="text-sm font-medium text-gray-900">
                    {`${booking.pickupAddress} to ${booking.dropoffAddress}`}
                  </p>
                  <p className="text-sm text-gray-500">Vehicle: {booking.vehicleType}</p>
                  <p className="text-sm text-gray-500">Price: ₹{booking.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Status: {booking.status}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(booking.createdAt).toLocaleString()}</p>
                </div>
                {booking.status === 'in_progress' && (
                  <button
                    onClick={() => handleTrackDriver(booking)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Track Driver
                  </button>
                )}
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

      {trackingBooking && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Tracking Driver for Booking: 
          </h2>
          <p>From: {trackingBooking.pickupAddress}</p>
          <p>To: {trackingBooking.dropoffAddress}</p>
          <OpenRouteMap
            driverLocation={driverLocation}
            pickupLocation={{
              latitude: trackingBooking.pickupLocation.coordinates[1],
              longitude: trackingBooking.pickupLocation.coordinates[0]
            }}
            dropoffLocation={{
              latitude: trackingBooking.dropoffLocation.coordinates[1],
              longitude: trackingBooking.dropoffLocation.coordinates[0]
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;