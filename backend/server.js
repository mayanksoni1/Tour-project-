const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Connect to MongoDB Atlas (no deprecated options)
mongoose.connect(process.env.MAYANKTOUR2)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// ✅ Destination Schema
const destinationSchema = new mongoose.Schema({
  name: String,
  location: String,
  type: String,
  budget: String
});
const Destination = mongoose.model("Destination", destinationSchema);

// ✅ Booking Schema
const bookingSchema = new mongoose.Schema({
  destination: String,
  user: String,
  email: String,
  phone: String,
  date: { type: Date, default: Date.now }
});
const Booking = mongoose.model("Booking", bookingSchema);

// ✅ Routes
app.get("/destinations", async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/destinations", async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.json({ message: "Destination added!", data: destination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking successful!", data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { name, location, type, budget } = req.query;
    const filter = {};
    if (name) filter.name = new RegExp(name, "i");
    if (location) filter.location = new RegExp(location, "i");
    if (type) filter.type = new RegExp(type, "i");
    if (budget) filter.budget = new RegExp(budget, "i");

    const results = await Destination.find(filter);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
