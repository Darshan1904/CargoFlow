// Function to calculate surge multiplier
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
            perKmRate = 5;  
            break;
        case 'car':
            perKmRate = 10;  
            break;
        case 'truck':
            perKmRate = 20;  
            break;
        default:
            perKmRate = 10;  
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
