const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");
const usersRoutes = require("./src/routes/usersRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://3wtask-rp.netlify.app", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Database successfully connected"))
  .catch((error) => console.log("There is an error connecting the DB", error));

// Routes
app.get("/", (req, res) => {
  res.send("Server is running smoothly");
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
