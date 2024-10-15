import { Link } from 'react-router-dom';

const UserDashboard = () => {
  // Mock data for past bookings
  const pastBookings = [
    { id: 1, date: '2024-10-10', from: 'Home', to: 'Office', status: 'Completed' },
    { id: 2, date: '2024-10-11', from: 'Office', to: 'Home', status: 'Completed' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
      <Link
        to="/booking"
        className="mb-6 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Book
      </Link>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Past Bookings</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {pastBookings.map((booking) => (
              <li key={booking.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                    <p className="text-sm text-gray-500">{`${booking.from} to ${booking.to}`}</p>
                  </div>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {booking.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;