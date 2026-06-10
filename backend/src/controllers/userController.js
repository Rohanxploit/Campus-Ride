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

    // Calculate rating
    const rating = user.ratingsReceived && user.ratingsReceived.length > 0 
      ? (user.ratingsReceived.reduce((acc, curr) => acc + curr.score, 0) / user.ratingsReceived.length).toFixed(1) 
      : 5.0;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      vehicle: user.vehicle,
      upiId: user.upiId,
      gender: user.gender,
      profilePhoto: user.profilePhoto,
      nationalId: user.nationalId,
      driverLicense: user.driverLicense,
      bankAccount: user.bankAccount,
      rating: parseFloat(rating),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicle, upiId, gender, profilePhoto, nationalId, driverLicense, bankAccount } = req.body;
    
    const updateData = { name, phone, upiId, gender, profilePhoto };
    if (req.user.role === "DRIVER") {
      if (nationalId !== undefined) updateData.nationalId = nationalId;
      if (driverLicense !== undefined) updateData.driverLicense = driverLicense;
      if (bankAccount !== undefined) updateData.bankAccount = bankAccount;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    // If driver updates vehicle
    if (req.user.role === "DRIVER" && vehicle) {
      await prisma.vehicle.upsert({
        where: { driverId: req.user.id },
        update: {
          type: vehicle.type,
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          rcNumber: vehicle.rcNumber,
          color: vehicle.color,
        },
        create: {
          driverId: req.user.id,
          type: vehicle.type,
          model: vehicle.model,
          licensePlate: vehicle.licensePlate,
          rcNumber: vehicle.rcNumber,
          color: vehicle.color,
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vehicle: true, ratingsReceived: true },
    });

    const rating = updatedUser.ratingsReceived && updatedUser.ratingsReceived.length > 0 
      ? (updatedUser.ratingsReceived.reduce((acc, curr) => acc + curr.score, 0) / updatedUser.ratingsReceived.length).toFixed(1) 
      : 5.0;

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      vehicle: updatedUser.vehicle,
      upiId: updatedUser.upiId,
      gender: updatedUser.gender,
      profilePhoto: updatedUser.profilePhoto,
      nationalId: updatedUser.nationalId,
      driverLicense: updatedUser.driverLicense,
      bankAccount: updatedUser.bankAccount,
      rating: parseFloat(rating),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating profile" });
  }
};
