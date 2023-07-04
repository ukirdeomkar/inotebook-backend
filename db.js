const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/inotebook";

// create connection to mongodb using mongoose package

const connectToMongo = async () => {
  let connection = await mongoose.connect(mongoURI);
  if (connection) {
    console.log("Connected to mongo");
  }
};

module.exports = connectToMongo;
