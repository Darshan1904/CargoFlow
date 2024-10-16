# ShipEase

ShipEase is a demo logistics platform that connects users with drivers for goods transportation. This proof-of-concept application demonstrates key features of an on-demand logistics system, including real-time tracking, price estimation, and driver-user matching.

## Features

- **User Authentication**: Secure login system for users and drivers
- **Booking Service**: Users can book vehicles for transporting goods
- **Real-Time Tracking**: Live location tracking of drivers and vehicles
- **Price Estimation**: Dynamic pricing based on distance, vehicle type, and demand
- **Driver Job Management**: Drivers can accept bookings and update job statuses
- **Place Suggestions**: Autocomplete feature for entering pickup and drop-off locations

## Technology Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **APIs**: OpenRouteService (Directions V2, GeoCodeAutoComplete, GeoCodeReverse)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- OpenRouteService API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Darshan1904/ShipEase.git
   cd ShipEase
   ```

2. Set up the backend:
   ```
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory with the following contents:
   ```
   ORS_API_KEY=your_openrouteservice_api_key
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=24h
   ```

3. Set up the frontend:
   ```
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory with the following contents:
   ```
   VITE_ORS_API_KEY=your_openrouteservice_api_key
   VITE_BACKEND_URL=http://localhost:5000 # or your backend URL
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run start
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd client
   npm run dev
   ```

The application should now be running. Access the frontend at `http://localhost:5173` (or the port specified by Vite).

## API Integration

ShipEase uses OpenRouteService APIs for various functionalities:

- **Directions V2**: Calculates routes and distances
- **GeoCodeAutoComplete**: Provides place suggestions based on user input
- **GeoCodeReverse**: Identifies places from latitude and longitude coordinates

## Finding Nearby Bookings for driver

For nearby job fetching for drivers, I have optimized the database with the following indexes on the Booking schema:

```javascript
// Indexes for optimally identifying nearby locations
bookingSchema.index({ pickupLocation: '2dsphere' });
bookingSchema.index({ dropoffLocation: '2dsphere' });
```

I use the following query to fetch nearby bookings:

```javascript
const nearbyBookings = await Booking.find({
    pickupLocation: {
        $near: {
            $geometry: {
                type: "Point",
                coordinates: [lngt, lat]
            },
            $maxDistance: maxDistance
        }
    },
    status: 'pending'
}).limit(10);
```

## Surge Pricing Algorithm

The application implements a basic surge pricing model:

```javascript
const getSurgeMultiplier = () => {
    const currentHour = new Date().getHours();

    // Peak hours for surge (Let's assume 7-9 AM and 5-7 PM)
    const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);

    // Simulate high demand (Can be replaced with more complex system)
    const isHighDemand = Math.random() > 0.7;

    let surgeMultiplier = 1;

    if (isPeakHour || isHighDemand) {
        surgeMultiplier = 1.5;  
    }

    return surgeMultiplier;
};

export const calculatePrice = (distance, vehicleType) => {
    let baseFare = 50;  // Base fare for all vehicles
    let perKmRate;

    // Set per km rate based on vehicle type
    switch (vehicleType) {
        case 'bike':
            perKmRate = 0.5;  
            break;
        case 'car':
            perKmRate = 1;  
            break;
        case 'truck':
            perKmRate = 2;  
            break;
        default:
            perKmRate = 1;  
            break;
    }

    let price = baseFare + (distance * perKmRate);

    // Get surge multiplier and apply it
    const surgeMultiplier = getSurgeMultiplier();
    price = price * surgeMultiplier;

    return {
        price: Math.round(price),
        surgeMultiplier,  
    };
};
```

This algorithm considers peak hours and simulates high demand to adjust pricing dynamically.

## Contributing

This is a demo project and is not actively maintained. However, if you'd like to suggest improvements or report issues, please feel free to open an issue or submit a pull request.

---

**Note**: This is a proof-of-concept application and is not intended for production use. Some features may be simplified or simulated for demonstration purposes.
