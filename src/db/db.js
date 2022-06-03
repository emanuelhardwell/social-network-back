const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN);
    console.log("Connection to the DB successfully");
  } catch (error) {
    console.log(error);
    throw new Error("----- Error to connect to DB Mongo Atlas -----");
  }
};

module.exports = { dbConnection };
