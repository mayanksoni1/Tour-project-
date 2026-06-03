const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// ✅ Allow requests from your GitHub Pages site
app.use(cors({
  origin: "https://mayanksoni1.github.io",  // your frontend domain
  methods: ["GET", "POST", "DELETE"],       // added DELETE
  allowedHeaders: ["Content-Type"]
}));

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MAYANKTOUR2)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// ✅ Destination Schema
const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  budget: { type: String, required: true }
});
const Destination = mongoose.model("Destination", destinationSchema);

// ✅ Booking Schema
const bookingSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  user: { type: String, required: true },
  email: { type: String, required: true, match: /.+@.+\..+/ },
  phone: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Booking = mongoose.model("Booking", bookingSchema);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// ✅ Routes
app.get("/destinations", async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destinations", error: err.message });
  }
});

app.post("/destinations", async (req, res) => {
  try {
    const destination = new Destination(req.body);
    await destination.save();
    res.json({ message: "Destination added!", data: destination });
  } catch (err) {
    res.status(400).json({ message: "Failed to add destination", error: err.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking successful!", data: booking });
  } catch (err) {
    res.status(400).json({ message: "Booking failed!", error: err.message });
  }
});

// ✅ DELETE booking route
app.delete("/bookings/:id", async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete booking", error: err.message });
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
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
