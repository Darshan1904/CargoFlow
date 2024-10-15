import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', 
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',  
        required: false,  // Assigned when driver accepts the job
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'car', 'truck'],
        required: true,
    },
    pickupLocation: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },  // [longitude, latitude]
    },
    dropoffLocation: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },  // [longitude, latitude]
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes for optimally identifying nearby locations
bookingSchema.index({ pickupLocation: '2dsphere' });
bookingSchema.index({ dropoffLocation: '2dsphere' });

export default mongoose.model('bookings', bookingSchema);