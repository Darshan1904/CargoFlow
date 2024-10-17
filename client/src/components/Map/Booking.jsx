import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';

const Booking = () => {
  const [pickup, setPickup] = useState({ name: '', coordinates: null });
  const [dropoff, setDropoff] = useState({ name: '', coordinates: null });
  const [vehicleType, setVehicleType] = useState('car');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetches location suggestions based on the input text.
   *
   * @param {string} input - The input text to get suggestions for. Must be at least 3 characters long.
   * @param {function} setSuggestions - The function to update the suggestions state.
   * @returns {Promise<void>} - A promise that resolves when the suggestions are fetched and state is updated.
   * @throws Will display an error toast and log the error to the console if the fetch fails.
  **/
  const fetchSuggestions = async (input, setSuggestions) => {
    if (input.length < 3) return;
    try {
      const response = await axios.get(`/api/geocode/autocomplete`, {
        params: { text: input }
      });
      setSuggestions(response.data.features.map(feature => ({
        name: feature.properties.label,
        coordinates: feature.geometry.coordinates
      })));
    } catch (error) {
      toast.error('Error fetching suggestions. Please try again later.');
      console.error('Error fetching suggestions:', error);
    }
  };

  // Debounce fetchSuggestions to reduce API calls.
  const debouncedFetchSuggestions = useCallback(
    debounce((input, setSuggestions) => fetchSuggestions(input, setSuggestions), 300),
    []
  );

  // Location change handler
  const handleLocationChange = (e, setLocation, setSuggestions) => {
    setLocation({ name: e.target.value, coordinates: null });
    debouncedFetchSuggestions(e.target.value, setSuggestions);
  };

  const handleLocationSelect = (location, setLocation, setSuggestions) => {
    setLocation({ name: location.name, coordinates: location.coordinates });
    setSuggestions([]);
  };


  /**
   * Estimates the price for a booking based on the provided pickup and dropoff locations and vehicle type.
   * 
   * This function sets the loading state, clears any previous price estimate, and makes an API call to 
   * retrieve the estimated price. If the pickup or dropoff locations are not valid, it shows an error toast.
  **/
  const estimatePrice = async () => {
    setIsEstimating(true);
    setPriceEstimate(null);
    try {
      if (!pickup.coordinates || !dropoff.coordinates) {
        toast.error('Please select valid pickup and dropoff locations from the suggestions');
        return;
      }

      const response = await axios.post('/api/bookings/price', {
        pickupLocation: pickup.coordinates,
        dropoffLocation: dropoff.coordinates,
        vehicleType
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });

      setPriceEstimate(response.data.estimatedPrice);
    } catch (error) {
      console.error('Error estimating price:', error);
      toast.error('Error estimating price. Please try again.');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      if (!pickup.coordinates || !dropoff.coordinates || !priceEstimate) {
        toast.error('Please complete all fields and estimate price before booking');
        return;
      }

      const response = await axios.post('/api/bookings', {
        pickupLocation: pickup.coordinates,
        dropoffLocation: dropoff.coordinates,
        vehicleType,
        price: priceEstimate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });

      console.log('Booking created:', response.data);
      toast.success('Booking created successfully!');
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error creating booking. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const isFormValid = pickup.coordinates && dropoff.coordinates && vehicleType && priceEstimate && !isEstimating && !isBooking;

  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Book a Ride</h1>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8">
          {[
            { type: 'pickup', state: pickup, setState: setPickup, suggestions: pickupSuggestions, setSuggestions: setPickupSuggestions },
            { type: 'dropoff', state: dropoff, setState: setDropoff, suggestions: dropoffSuggestions, setSuggestions: setDropoffSuggestions }
          ].map(({ type, state, setState, suggestions, setSuggestions }) => (
            <div key={type} className="mb-6">
              <label htmlFor={type} className="block text-gray-700 text-sm font-bold mb-2 capitalize">
                {type} Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id={type}
                  value={state.name}
                  onChange={(e) => handleLocationChange(e, setState, setSuggestions)}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleLocationSelect(suggestion, setState, setSuggestions)}
                      >
                        {suggestion.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {state.coordinates && (
                <p className="mt-1 text-sm text-green-600">✓ Location selected</p>
              )}
            </div>
          ))}
          <div className="mb-6">
            <label htmlFor="vehicleType" className="block text-gray-700 text-sm font-bold mb-2">
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              disabled={isEstimating || !pickup.coordinates || !dropoff.coordinates}
              className={`w-full bg-black text-white font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ${(isEstimating || !pickup.coordinates || !dropoff.coordinates) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isEstimating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Estimating...
                </span>
              ) : 'Estimate Price'}
            </button>
          </div>
          {priceEstimate !== null && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
              <p className="font-bold">Estimated Price:</p>
              <p className="text-2xl">₹{priceEstimate.toFixed(2)}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full bg-black text-white font-bold py-3 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isBooking ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking...
                </span>
              ) : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;