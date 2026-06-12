const prisma = require("../prismaClient");
const jwt = require("jsonwebtoken");

module.exports = (io) => {
  // Mapping of user IDs to socket IDs
  const userSockets = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded.user;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);
    userSockets.set(socket.user.id, socket.id);

    // Join a room for their own ID to receive private messages
    socket.join(`user_${socket.user.id}`);

    // Join ride room for reconnections
    socket.on("join_ride_room", (data) => {
      if (data && data.rideId) {
        socket.join(`ride_${data.rideId}`);
      }
    });

    // Driver location updates
    socket.on("update_driver_location", async (data) => {
      if (socket.user.role === "DRIVER") {
        await prisma.user.update({
          where: { id: socket.user.id },
          data: { currentLat: data.lat, currentLng: data.lng },
        });
        // Broadcast location to all clients (or could be specific to a ride room)
        io.emit("driver_location_update", {
          driverId: socket.user.id,
          lat: data.lat,
          lng: data.lng,
        });
      }
    });

    // Passenger location updates
    socket.on("update_passenger_location", async (data) => {
      if (socket.user.role === "PASSENGER") {
        const { rideId, lat, lng } = data;
        // Broadcast location to the specific ride room
        io.to(`ride_${rideId}`).emit("passenger_location_update", {
          rideId,
          lat,
          lng,
        });
      }
    });

    // Accept Ride
    socket.on("accept_ride", async (data) => {
      const { rideId } = data;
      try {
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (ride) {
          if (ride.driverId === null && ride.status === "REQUESTED") {
            const updatedRide = await prisma.ride.update({
              where: { id: rideId },
              data: { status: "ACCEPTED", driverId: socket.user.id },
              include: { driver: { select: { name: true, phone: true, vehicle: true, currentLat: true, currentLng: true } } },
            });

            // Notify the passenger
            io.to(`user_${ride.passengerId}`).emit("ride_accepted", updatedRide);
            
            // Join a specific room for this ride
            socket.join(`ride_${rideId}`);
            const passengerSocketId = userSockets.get(ride.passengerId);
            if (passengerSocketId) {
              io.sockets.sockets.get(passengerSocketId)?.join(`ride_${rideId}`);
            }
          } else {
            // Ride is already taken
            socket.emit("ride_already_taken", { rideId });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Update ride status (IN_PROGRESS, COMPLETED)
    socket.on("update_ride_status", async (data) => {
      const { rideId, status } = data;
      try {
        const updatedRide = await prisma.ride.update({
          where: { id: rideId },
          data: { status },
        });
        
        // Notify everyone in the ride room
        io.to(`ride_${rideId}`).emit("ride_status_updated", updatedRide);
      } catch (err) {
        console.error(err);
      }
    });

    // Cancel ride (Passenger)
    socket.on("cancel_ride", async (data) => {
      const { rideId } = data;
      try {
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (ride && ride.passengerId === socket.user.id && ride.status !== "COMPLETED") {
          const updatedRide = await prisma.ride.update({
            where: { id: rideId },
            data: { status: "CANCELLED" },
          });

          // Notify everyone in the ride room (e.g. if driver had already accepted)
          io.to(`ride_${rideId}`).emit("ride_status_updated", updatedRide);
          
          // Also broadcast to all online drivers so they can remove it from incoming requests
          const onlineDrivers = await prisma.user.findMany({
            where: { role: "DRIVER", isOnline: true },
            select: { id: true },
          });

          onlineDrivers.forEach(driver => {
            io.to(`user_${driver.id}`).emit("ride_cancelled_by_passenger", { rideId });
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Cancel ride (Driver)
    socket.on("cancel_ride_driver", async (data) => {
      const { rideId } = data;
      try {
        const ride = await prisma.ride.findUnique({ where: { id: rideId } });
        if (ride && ride.driverId === socket.user.id && ride.status !== "COMPLETED") {
          const updatedRide = await prisma.ride.update({
            where: { id: rideId },
            data: { status: "CANCELLED" },
          });

          // Notify everyone in the ride room
          io.to(`ride_${rideId}`).emit("ride_status_updated", updatedRide);
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Passenger requests ride (creates ride in DB, then notifies online drivers)
    socket.on("new_ride_request", async (ride) => {
      // Find all online drivers and emit the new request
      const onlineDrivers = await prisma.user.findMany({
        where: { role: "DRIVER", isOnline: true },
        select: { id: true },
      });

      onlineDrivers.forEach(driver => {
        io.to(`user_${driver.id}`).emit("incoming_ride_request", ride);
      });
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.id}`);
      userSockets.delete(socket.user.id);
      
      if (socket.user.role === "DRIVER") {
        await prisma.user.update({
          where: { id: socket.user.id },
          data: { isOnline: false },
        });
        io.emit("driver_offline", { driverId: socket.user.id });
      }
    });
  });
};
