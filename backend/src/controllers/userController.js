const prisma = require("../prismaClient");

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicle: true,
        ratingsReceived: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vehicle: user.vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicle, upiId } = req.body;
    
    const updateData = { name, phone, upiId };

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    // If driver updates vehicle
    if (req.user.role === "DRIVER" && vehicle) {
      await prisma.vehicle.upsert({
        where: { driverId: req.user.id },
        update: {
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
        },
        create: {
          driverId: req.user.id,
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vehicle: true },
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      vehicle: updatedUser.vehicle,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating profile" });
  }
};
