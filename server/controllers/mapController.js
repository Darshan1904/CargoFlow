import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

// @desc    Get suggestions for places
// @route   GET /api/geocode/autocomplete
export const getSuggestions = async(req, res) => {
    try {
        const response = await axios.get('https://api.openrouteservice.org/geocode/autocomplete', {
          params: {
            api_key: process.env.ORS_API_KEY,
            text: req.query.text,
          }
        });
        res.json(response.data);
      } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data' });
      }
}

// @desc    Get directions/route between two places
// @route   GET /api/geocode/directions
export const getDirections = async (req, res) => {
  
  const start = req.query.start.replace(/['"`]/g, ''); 
  const end = req.query.end.replace(/['"`]/g, ''); 

  try {
    const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
      params: {
        api_key: process.env.ORS_API_KEY,
        start,
        end,
      }
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};
