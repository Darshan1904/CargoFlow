import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

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