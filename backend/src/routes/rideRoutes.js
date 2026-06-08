const express = require("express");
const router = express.Router();
const rideController = require("../controllers/rideController");
const authMiddleware = require("../middleware/authMiddleware");

// Request a new ride (Passenger)
router.post("/request", authMiddleware, rideController.requestRide);

// Get available drivers (Passenger)
router.get("/drivers", authMiddleware, rideController.getAvailableDrivers);

// Update driver availability (Driver)
router.put("/availability", authMiddleware, rideController.updateAvailability);

// Get active rides for driver or passenger
router.get("/active", authMiddleware, rideController.getActiveRide);

// Get pending ride requests for drivers
router.get("/requests", authMiddleware, rideController.getPendingRequests);

// Get ride history
router.get("/history", authMiddleware, rideController.getRideHistory);

// Add rating to ride
router.post("/:id/rating", authMiddleware, rideController.submitRating);

module.exports = router;
