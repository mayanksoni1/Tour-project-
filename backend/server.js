const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

app.use(express.json());

// ✅ Connect to MongoDB Atlas
mongoose.connect("mongodb://touruser:1302Travel@ac-ce2xpzg-shard-00-00.raukfge.mongodb.net:27017,ac-ce2xpzg-shard-00-01.raukfge.mongodb.net:27017,ac-ce2xpzg-shard-00-02.raukfge.mongodb.net:27017/?ssl=true&replicaSet=atlas-11h8xo-shard-0&authSource=admin&appName=TourCluster")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// ✅ Define Destination Schema
const destinationSchema = new mongoose.Schema({
  name: String,
  location: String,
  type: String,
  budget: String
});

const Destination = mongoose.model("Destination", destinationSchema);

// ✅ Route to get destinations from MongoDB
app.get("/destinations", async (req, res) => {
  const destinations = await Destination.find();
  res.json(destinations);
});

// ✅ Route to add booking (temporary in-memory)
let bookings = [];
app.post("/bookings", (req, res) => {
  bookings.push(req.body);
  res.json({ message: "Booking successful!", data: req.body });
});

// ✅ Route to add a destination to MongoDB
app.post("/destinations", async (req, res) => {
  try {
    const destination = new Destination(req.body); // create new doc from request body
    await destination.save(); // save to MongoDB
    res.json({ message: "Destination added!", data: destination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Route to search destinations by query parameters
app.get("/search", async (req, res) => {
  try {
    const { name, location, type, budget } = req.query;
    const filter = {};

    if (name) filter.name = new RegExp(name, "i");       // case-insensitive match
    if (location) filter.location = new RegExp(location, "i");
    if (type) filter.type = new RegExp(type, "i");
    if (budget) filter.budget = new RegExp(budget, "i");

    const results = await Destination.find(filter);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// mongodb+srv://touruser:1302Travel@tourcluster.raukfge.mongodb.net/?appName=TourCluster      


//mongodb://touruser:1302Travel@ac-ce2xpzg-shard-00-00.raukfge.mongodb.net:27017,ac-ce2xpzg-shard-00-01.raukfge.mongodb.net:27017,ac-ce2xpzg-shard-00-02.raukfge.mongodb.net:27017/?ssl=true&replicaSet=atlas-11h8xo-shard-0&authSource=admin&appName=TourCluster