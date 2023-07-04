const connectToMongo = require("./db");
require('dotenv').config();
//check if successfuly connected to db
connectToMongo();

// add express js and setup node server at port 5000
const express = require("express");
const app = express();
const port = 5000;

// create routes using express
app.use(express.json());
// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

// localhost
app.listen(port, () => {
  console.log(`Example app listening on port : http://localhost:${port}`);
});
