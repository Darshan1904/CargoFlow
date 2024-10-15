import Booking from "../models/Booking.model.js";
import { calculatePrice } from "../utils/calculatePrice.js";
import { calculateDistance } from "../utils/calculateDistance.js";

// @desc  Calcuate Estimated price
// @route GET /api/bookings/estimatePrice
export const estimatePrice = async (req, res) => {
    const { pickupLocation, dropoffLocation, vehicleType } = req.body;

    // Validation
    if (!pickupLocation || !dropoffLocation || !vehicleType) {
        return res.status(400).json({ error: "Please provide valid pickup, dropoff locations, and vehicle type" });
    }

    try {
        // Calculate distance between pickup and dropoff locations
        const distance = await calculateDistance(pickupLocation, dropoffLocation);
        
        if(distance==null){
            return res.status(500).json({ error: "Error calculating distance" });
        }

        // Calculate estimated price, including surge multiplier
        const { price, surgeMultiplier } = calculatePrice(distance, vehicleType);

        res.status(200).json({ estimatedPrice: price, distance, surgeMultiplier });
    } catch (err) {
        res.status(500).json({ error: "Error calculating price" });
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Customer
export const createBooking = async (req, res) => {
    const { vehicleType, pickupLocation, dropoffLocation, price } = req.body;
    const role = req.user.role;

    if (role !== 'customer') {
        return res.status(403).json({ error: "Only customer accounts can make booking." });
    }

    const customer = req.user._id; 

    if (!pickupLocation || !dropoffLocation || !vehicleType || !price) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const booking = new Booking({
            customer,
            vehicleType,
            pickupLocation : {
                type: "Point",
                coordinates: pickupLocation,
            },
            dropoffLocation : {
                type: "Point",
                coordinates: dropoffLocation,
            },
            price,
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Server error" });
    }
};

// @desc    Update booking status (e.g., driver accepts job, in-progress, completed)
// @route   PUT /api/bookings/:id/status
// @access  Driver
export const updateBookingStatus = async (req, res) => {
    const { status } = req.body;
    const role = req.user.role;

    if (role !== 'driver') {
        return res.status(403).json({ error: "Only driver accounts can update booking status." });
    }

    const driver = req.user._id;  
    const bookingId = req.params.id;

    if (!['accepted', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.driver && booking.driver.toString() !== driver.toString()) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        if (!booking.driver && status === 'accepted') {
            booking.driver = driver;  // Assign driver if booking is accepted
        }

        booking.status = status;
        if (status === 'completed') {
            booking.completedAt = Date.now();
        }

        await booking.save();
        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ error: "Server error", err });
    }
};

// @desc    Get active bookings for customer or driver
// @route   GET /api/bookings/active
// @access  Customer/Driver
export const getActiveBookings = async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;

    try {
        let query = {};
        if (role === 'customer') {
            query.customer = userId;
            query.status = { $in: ['pending', 'in_progress'] };
        } else if (role === 'driver') {
            query.driver = userId;
            query.status = { $in: ['accepted', 'in_progress'] };
        }

        const bookings = await Booking.find(query).populate('customer driver', 'name email');
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

// @desc    Get nearby bookings for driver
// @route   GET /api/bookings/nearby
export const getNearbyBookings = async (req, res) => {
    const { lat, lng } = req.query;
    const maxDistance = 10000; // 10 km radius
  
    try {
      const nearbyBookings = await Booking.find({
        pickupCoordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: maxDistance
          }
        },
        status: 'pending'
      }).limit(10); // Limit to 10 nearby bookings
  
      res.status(200).json(nearbyBookings);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
};
