import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const ORS_API_KEY = process.env.ORS_API_KEY;

export const calculateDistance = async (pickupLocation, dropoffLocation) => {
    try {
        const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
            params: {
                start: `${pickupLocation.coordinates[0]},${pickupLocation.coordinates[1]}`,
                end: `${dropoffLocation.coordinates[0]},${dropoffLocation.coordinates[1]}`,
            },
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        // Check distance 
        if (!response.data.features[0].properties.segments[0].distance) {
            throw new Error("Distance not found");
        }

        const distance = response.data.features[0].properties.segments[0].distance;
        return distance / 1000; // Convert from meters to kilometers
    } catch (error) {
        console.error("Error fetching distance:", error.message);
        throw new Error("Could not calculate distance");
    }
};
