// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const volunteerRoutes = require("./routes/volunteer");
const ngoRoutes = require("./routes/ngo");
const matchRoutes = require("./routes/match");
const aiRoutes = require("./routes/ai"); // <--- Import AI routes

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/volunteer", volunteerRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/ai", aiRoutes); // <--- Use AI routes

app.listen(process.env.PORT, () => {
  console.log("Backend running on port", process.env.PORT);
});