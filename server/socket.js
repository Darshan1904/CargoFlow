const setupSocket = (io) => {
    const bookingRooms = new Map();
  
    io.on('connection', (socket) => {
      console.log('A user connected');
  
      socket.on('join-booking-room', (bookingId) => {
        socket.join(bookingId);
        console.log(`User joined booking room: ${bookingId}`);
      });
  
      socket.on('update-driver-location', ({ bookingId, location }) => {
        io.to(bookingId).emit('driver-location-updated', location);
        console.log(`Driver location updated for booking: ${bookingId}`);
      });
  
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  };
  
  export default setupSocket;