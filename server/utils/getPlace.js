import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ORS_API_KEY = process.env.ORS_API_KEY;
export const reverseGeocode = async (coordinates) => {
    try {
      const response = await axios.get(`https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${coordinates[0]}&point.lat=${coordinates[1]}`);
      return response.data.features[0].properties.label;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return 'Unknown location';
    }
};