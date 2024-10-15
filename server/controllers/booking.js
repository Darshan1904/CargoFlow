import Booking from "../models/Booking.model.js";
import { calculatePrice } from "../utils/calculatePrice.js";
import { calculateDistance } from "../utils/calculateDistance.js";
import { reverseGeocode } from "../utils/getPlace.js";

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
    try {
      const activeBookings = await Booking.find({
        customer: req.user._id,
        status: { $in: ['pending', 'accepted', 'in_progress'] }
      }).sort('-createdAt');

      const bookingsWithAddresses = await Promise.all(activeBookings.map(async (booking) => {
        const pickupAddress = await reverseGeocode(booking.pickupLocation.coordinates);
        const dropoffAddress = await reverseGeocode(booking.dropoffLocation.coordinates);
        return {
          ...booking.toObject(),
          pickupAddress,
          dropoffAddress
        };
      }));
  
      res.json(bookingsWithAddresses);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// @desc    Get past bookings for customer
// @route   GET /api/bookings/past
export const getPastBookings = async (req, res) => {
    try {
        let pastBookings;
        if (req.user.role === 'customer') {
            // Fetch completed bookings for the customer
            pastBookings = await Booking.find({
                customer: req.user._id,
                status: 'completed'
            }).sort('-completedAt');
        } else if (req.user.role === 'driver') {
            // Fetch completed jobs for the driver
            pastBookings = await Booking.find({
                driver: req.user._id,
                status: 'completed'
            }).sort('-completedAt');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

      const bookingsWithAddresses = await Promise.all(pastBookings.map(async (booking) => {
        const pickupAddress = await reverseGeocode(booking.pickupLocation.coordinates);
        const dropoffAddress = await reverseGeocode(booking.dropoffLocation.coordinates);
        return {
          ...booking.toObject(),
          pickupAddress,
          dropoffAddress
        };
      }));

      res.json(bookingsWithAddresses);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

// @desc    Get nearby bookings for driver
// @route   GET /api/bookings/nearby
export const getNearbyBookings = async (req, res) => {
    const { latitude, longitude } = req.query;
    const maxDistance = 100000; // 100 km radius
  
    // Validate lat and lng
    const lat = parseFloat(latitude);
    const lngt = parseFloat(longitude);

    try {
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

        const bookingsWithAddresses = await Promise.all(nearbyBookings.map(async (booking) => {
            const pickupAddress = await reverseGeocode(booking.pickupLocation.coordinates);
            const dropoffAddress = await reverseGeocode(booking.dropoffLocation.coordinates);
            return {
                ...booking,
                pickupAddress,
                dropoffAddress
            };
        }));
  
        res.status(200).json(bookingsWithAddresses);
    } catch (err) {
        console.error("Error in getNearbyBookings:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
};


// @desc    Get current booking for driver
// @route   GET /api/bookings/current
export const getCurrentBooking = async (req, res) => {
    try {
      const currentBooking = await Booking.findOne({
        driver: req.user._id,
        status: { $in: ['accepted', 'in_progress'] }
      });
  
      if (!currentBooking) {
        return res.status(404).json({ message: "No current booking found" });
      }
  
      const pickupAddress = await reverseGeocode(currentBooking.pickupLocation.coordinates);
      const dropoffAddress = await reverseGeocode(currentBooking.dropoffLocation.coordinates);
  
      res.json({
        ...currentBooking.toObject(),
        pickupAddress,
        dropoffAddress
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

// @desc    Accept a booking
// @route   PUT /api/bookings/:id/accept
// @access  Driver
export const acceptBooking = async (req, res) => {
    const role = req.user.role;
    const driver = req.user._id;
    const bookingId = req.params.id;

    if (role !== 'driver') {
        return res.status(403).json({ error: "Only driver accounts can accept bookings." });
    }

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ error: "This booking is no longer available" });
        }

        booking.driver = driver;
        booking.status = 'accepted';

        await booking.save();

        const pickupAddress = await reverseGeocode(booking.pickupLocation.coordinates);
        const dropoffAddress = await reverseGeocode(booking.dropoffLocation.coordinates);

        res.status(200).json({
            ...booking.toObject(),
            pickupAddress,
            dropoffAddress
        });
    } catch (err) {
        console.error("Error in acceptBooking:", err);
        res.status(500).json({ error: "Server error", message: err.message });
    }
};