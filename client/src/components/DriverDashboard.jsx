import { useState, useEffect } from 'react';
import axios from '../axios';

const DriverDashboard = () => {
  const [currentJob, setCurrentJob] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchCurrentJob();
    fetchPastJobs();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyJobs();
    }
  }, [location]);

  const fetchCurrentJob = async () => {
    try {
      const response = await axios.get('/api/bookings/current', {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (response.data) {
        setCurrentJob(response.data);
      }
    } catch (error) {
      console.error('Error fetching current job:', error);
    }
  };

  const fetchNearbyJobs = async () => {
    try {
      const response = await axios.get('/api/bookings/nearby', {
        params: location,
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });

      setAvailableJobs(response.data);
    } catch (error) {
      console.error('Error fetching nearby jobs:', error);
    }
  };

  const fetchPastJobs = async () => {
    try {
      const response = await axios.get('/api/bookings/past', {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      setPastJobs(response.data);
    } catch (error) {
      console.error('Error fetching past jobs:', error);
    }
  };

  const acceptJob = async (job) => {
    try {
      await axios.put(`/api/bookings/${job._doc._id}/accept`, {}, {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      setCurrentJob(job);
      setAvailableJobs(availableJobs.filter((j) => j._id !== job._id));
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const updateJobStatus = async (status) => {
    try {
      await axios.put(`/api/bookings/${currentJob._id}/status`, {
        status,
      }, {
        headers: {
          'authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      if (status === 'completed') {
        setCurrentJob(null);
        fetchNearbyJobs();
        fetchPastJobs();
      } else {
        fetchCurrentJob();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const renderJobList = (jobs, title) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <li key={job._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {`${job.pickupAddress} to ${job.dropoffAddress}`}
                  </p>
                  <p className="text-sm text-gray-500">Vehicle: {job.vehicleType}</p>
                  <p className="text-sm text-gray-500">Earnings: ₹{job.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(job.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
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
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
      {currentJob ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Job</h2>
          <p>Pickup: {currentJob.pickupAddress}</p>
          <p>Dropoff: {currentJob.dropoffAddress}</p>
          <p>Vehicle Type: {currentJob.vehicleType}</p>
          <p>Earnings: ₹{currentJob.price.toFixed(2)}</p>
          <p>Status: {currentJob.status}</p>
          {currentJob.status === 'accepted' && (
            <button
              onClick={() => updateJobStatus('in_progress')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Start Job
            </button>
          )}
          {currentJob.status === 'in_progress' && (
            <button
              onClick={() => updateJobStatus('completed')}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Complete Job
            </button>
          )}
        </div>
      ) : (
        <p className="mb-6">No current job. Accept a job from the list below.</p>
      )}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Available Jobs Nearby</h2>
        {availableJobs.length ? <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {availableJobs.map((job) => (
              <li key={job._doc._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {`${job.pickupAddress} to ${job.dropoffAddress}`}
                    </p>
                    <p className="text-sm text-gray-500">Vehicle: {job._doc.vehicleType}</p>
                    <p className="text-sm text-gray-500">Earnings: ₹{job._doc.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => acceptJob(job)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Accept
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        :

        <p>No available jobs nearby.</p>
      }
      </div>
      {renderJobList(pastJobs, "Past Jobs")}
    </div>
  );
};

export default DriverDashboard;