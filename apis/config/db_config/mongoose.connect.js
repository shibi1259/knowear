require("dotenv").config();
const mongoose = require("mongoose");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connection = mongoose.connect(process.env.MONGODB, options);

module.exports = { connection };
