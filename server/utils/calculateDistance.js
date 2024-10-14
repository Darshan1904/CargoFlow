
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
}

export const calculateDistance = async (pickupLocation, dropoffLocation) => {
  if (!pickupLocation || !dropoffLocation) {
    throw new Error("All fields are required");
  }

  try {
    const [pickupLat, pickupLon] = pickupLocation.coordinates;
    const [dropoffLat, dropoffLon] = dropoffLocation.coordinates;

    const distanceInKm = calculateHaversineDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);

    return distanceInKm;
  } catch (err) {
    console.log("Error calculating distance: ", err);
    return null;
  }
};