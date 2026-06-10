const prisma = require("../prismaClient");

exports.requestRide = async (req, res) => {
  try {
    if (req.user.role !== "PASSENGER") {
      return res.status(403).json({ message: "Only passengers can request rides" });
    }

    const { pickupAddress, destAddress, pickupLat, pickupLng, destLat, destLng } = req.body;
    
    // Flat fare for IIT Roorkee campus
    const fare = 10;

    const ride = await prisma.ride.create({
      data: {
        passengerId: req.user.id,
        pickupLat,
        pickupLng,
        pickupAddress,
        destLat,
        destLng,
        destAddress,
        fare,
        status: "REQUESTED",
      },
    });

    res.json(ride);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: {
        role: "DRIVER",
        isOnline: true,
      },
      select: {
        id: true,
        name: true,
        currentLat: true,
        currentLng: true,
        vehicle: true,
      },
    });
    res.json(drivers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({ message: "Only drivers can update availability" });
    }

    const { isOnline, lat, lng } = req.body;

    const driver = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isOnline,
        ...(lat && lng ? { currentLat: lat, currentLng: lng } : {}),
      },
      select: { id: true, isOnline: true, currentLat: true, currentLng: true },
    });

    res.json(driver);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.submitRating = async (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;

  try {
    const ride = await prisma.ride.findUnique({ where: { id: parseInt(id) } });
    if (!ride || ride.passengerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized or ride not found" });
    }

    const rating = await prisma.rating.create({
      data: {
        rideId: ride.id,
        driverId: ride.driverId,
        score,
        feedback
      }
    });

    res.json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error submitting rating" });
  }
};

exports.getActiveRide = async (req, res) => {
  try {
    const ride = await prisma.ride.findFirst({
      where: {
        OR: [
          { passengerId: req.user.id },
          { driverId: req.user.id },
        ],
        status: {
          in: ["REQUESTED", "ACCEPTED", "ARRIVED", "IN_PROGRESS"],
        },
      },
      include: {
        passenger: { select: { id: true, name: true, phone: true } },
        driver: { select: { id: true, name: true, phone: true, vehicle: true } },
      },
    });

    res.json(ride || null);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getRideHistory = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where: {
        OR: [
          { passengerId: req.user.id },
          { driverId: req.user.id },
        ],
        status: {
          in: ["COMPLETED", "CANCELLED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        driver: { select: { name: true } },
        passenger: { select: { name: true } },
      },
    });
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    if (req.user.role !== "DRIVER") {
      return res.status(403).json({ message: "Only drivers can view pending requests" });
    }
    const rides = await prisma.ride.findMany({
      where: {
        status: "REQUESTED",
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        passenger: { select: { name: true } },
      },
    });
    res.json(rides);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
