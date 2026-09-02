const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const { protect } = require("../middleware/auth");

router.use(protect); 


router.get("/", async (req, res) => {
  const appointments = await Appointment.find({ owner: req.user.id }).sort({
    scheduledFor: 1,
  });
  res.json({ appointments });
});

router.post("/", async (req, res) => {
  const appointment = await Appointment.create({
    doctor: req.body.doctor,
    reason: req.body.reason,
    scheduledFor: req.body.scheduledFor,
    owner: req.user.id, 
  });
  res.status(201).json({ appointment });
});


router.put("/:id", async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { doctor: req.body.doctor, reason: req.body.reason },
    { new: true, runValidators: true }
  );

  if (!appointment) return res.status(404).json({ msg: "Not found" });
  res.json({ appointment });
});

router.delete("/:id", async (req, res) => {
  const appointment = await Appointment.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!appointment) return res.status(404).json({ msg: "Not found" });
  res.json({ msg: "Cancelled", id: req.params.id });
});

module.exports = router;
