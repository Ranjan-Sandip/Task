const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to your MongoDB database
mongoose.connect("mongodb://localhost:27017/nusd", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema for ETH prices
const ethPriceSchema = new mongoose.Schema({
  price: Number,
  timestamp: { type: Date, default: Date.now },
});

// Create a model for ETH prices
const EthPrice = mongoose.model("EthPrice", ethPriceSchema);

// Route to fetch the latest ETH price from the database
app.get("/eth-price", async (req, res) => {
  try {
    const latestPrice = await EthPrice.findOne().sort({ timestamp: -1 }).lean();
    res.json(latestPrice);
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
