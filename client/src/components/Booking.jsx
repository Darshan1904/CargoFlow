import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import debounce from 'lodash.debounce';

const API_KEY = import.meta.env.VITE_ORS_API_KEY;

const Booking = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const navigate = useNavigate();

  const fetchSuggestions = async (input, setSuggestions) => {
    if (input.length < 3) return;
    try {
      const response = await axios.get(`https://api.openrouteservice.org/geocode/autocomplete`, {
        params: {
          api_key: API_KEY,
          text: input,
        }
      });
      setSuggestions(response.data.features.map(feature => ({
        name: feature.properties.label,
        coordinates: feature.geometry.coordinates
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((input, setSuggestions) => fetchSuggestions(input, setSuggestions), 1000),
    []
  );

  const handlePickupChange = (e) => {
    setPickup(e.target.value);
    debouncedFetchSuggestions(e.target.value, setPickupSuggestions);
  };

  const handleDropoffChange = (e) => {
    setDropoff(e.target.value);
    debouncedFetchSuggestions(e.target.value, setDropoffSuggestions);
  };

  const handleLocationSelect = (location, setLocation, setSuggestions) => {
    setLocation(location.name);
    setSuggestions([location]);
  };

  const estimatePrice = async () => {
    try {
      const pickupLocation = pickupSuggestions.find(s => s.name === pickup);
      const dropoffLocation = dropoffSuggestions.find(s => s.name === dropoff);
      
      if (!pickupLocation || !dropoffLocation) {
        console.error('Invalid locations');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/bookings/price', {
        pickupLocation: pickupLocation.coordinates,
        dropoffLocation: dropoffLocation.coordinates,
        vehicleType
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });

      setPriceEstimate(response.data.estimatedPrice);
    } catch (error) {
      console.error('Error estimating price:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pickupLocation = pickupSuggestions.find(s => s.name === pickup);
      const dropoffLocation = dropoffSuggestions.find(s => s.name === dropoff);
      
      if (!pickupLocation || !dropoffLocation || !priceEstimate) {
        console.error('Invalid booking data');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/bookings', {
        pickupLocation: pickupLocation.coordinates,
        dropoffLocation: dropoffLocation.coordinates,
        vehicleType,
        price: priceEstimate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });

      console.log('Booking created:', response.data);
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book a Ride</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="pickup" className="block text-gray-700 text-sm font-bold mb-2">
            Pickup Location
          </label>
          <input
            type="text"
            id="pickup"
            value={pickup}
            onChange={handlePickupChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {pickupSuggestions.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
              {pickupSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleLocationSelect(suggestion, setPickup, setPickupSuggestions)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="dropoff" className="block text-gray-700 text-sm font-bold mb-2">
            Dropoff Location
          </label>
          <input
            type="text"
            id="dropoff"
            value={dropoff}
            onChange={handleDropoffChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {dropoffSuggestions.length > 0 && (
            <ul className="mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
              {dropoffSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleLocationSelect(suggestion, setDropoff, setDropoffSuggestions)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="vehicleType" className="block text-gray-700 text-sm font-bold mb-2">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="car">Car</option>
            <option value="truck">Truck</option>
            <option value="bike">Bike</option>
          </select>
        </div>
        <div className="mb-6">
          <button
            type="button"
            onClick={estimatePrice}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Estimate Price
          </button>
          {priceEstimate && (
            <p className="mt-2 text-gray-700">Estimated Price: ₹{priceEstimate}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Book Now
          </button>
        </div>
      </form>
    </div>
  );
};

export default Booking;