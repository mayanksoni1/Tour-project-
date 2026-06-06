const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // install with: npm install axios

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "mysecretkey";

// Middleware
app.use(express.json());

// ✅ Allow requests from your GitHub Pages site
app.use(cors({
  origin: "https://mayanksoni1.github.io",  // your frontend domain
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
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

// ✅ Admin credentials
const ADMIN_USER = "Mayank7987";
const ADMIN_PASS = "2003Mayank";

// ✅ Admin login route
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: "admin" }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// ✅ Middleware to protect admin routes
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

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

// ✅ DELETE booking (protected)
app.delete("/bookings/:id", verifyAdmin, async (req, res) => {
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

// ✅ Database search route
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

// ✅ Smart Search Route (Wikipedia summary + Wikimedia REST media)
app.get("/smart-search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: "No search query provided" });
    }

    // Wikipedia summary
    const wikiRes = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    );
    const description = wikiRes.data.extract || "No description available";

    // Wikimedia REST media API for images
    const imageRes = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/media/${encodeURIComponent(query)}`
    );
    const items = imageRes.data.items || [];
    const firstImage = items.find(item => item.type === "image");
    const imageUrl = firstImage?.srcset?.[0]?.src || "https://via.placeholder.com/400";

    res.json({
      name: query,
      description,
      image: imageUrl
    });
  } catch (err) {
    console.error("Smart search error:", err.message);
    res.status(500).json({ message: "Smart search failed", error: err.message });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
