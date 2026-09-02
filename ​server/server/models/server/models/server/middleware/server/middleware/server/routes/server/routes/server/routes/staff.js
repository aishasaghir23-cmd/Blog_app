const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");


router.get(
  "/appointments",
  protect,
  requireRole("staff"),
  async (req, res) => {
    const appointments = await Appointment.find()
      .populate("owner", "name email")
      .sort({ scheduledFor: 1 });
    res.json({ appointments });
  }
);

router.patch(
  "/appointments/:id/status",
  protect,
  requireRole("staff"),
  async (req, res) => {
    const { status } = req.body;
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ appointment });
  }
);

module.exports = router;
