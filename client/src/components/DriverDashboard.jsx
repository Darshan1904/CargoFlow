import { useState } from 'react';

const DriverDashboard = () => {
  const [currentJob, setCurrentJob] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([
    { id: 1, pickup: 'Downtown', dropoff: 'Airport', earnings: '$25' },
    { id: 2, pickup: 'Suburb', dropoff: 'City Center', earnings: '$30' },
  ]);

  const acceptJob = (job) => {
    setCurrentJob(job);
    setAvailableJobs(availableJobs.filter((j) => j.id !== job.id));
  };

  const completeJob = () => {
    setCurrentJob(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
      {currentJob ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Job</h2>
          <p>Pickup: {currentJob.pickup}</p>
          <p>Dropoff: {currentJob.dropoff}</p>
          <p>Earnings: {currentJob.earnings}</p>
          <button
            onClick={completeJob}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Complete Job
          </button>
        </div>
      ) : (
        <p className="mb-6">No current job. Accept a job from the list below.</p>
      )}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Jobs</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {availableJobs.map((job) => (
              <li key={job.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{`${job.pickup} to ${job.dropoff}`}</p>
                    <p className="text-sm text-gray-500">Earnings: {job.earnings}</p>
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
      </div>
    </div>
  );
};

export default DriverDashboard;