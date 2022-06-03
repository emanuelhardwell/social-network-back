const express = require("express");
const { dbConnection } = require("./db/db");
require("dotenv").config();
const cors = require("cors");

const app = express();

// use of DB
dbConnection();

// cors
app.use(cors());

// middlewares
app.use(express.json());

// rutas

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server running in the port ${process.env.PORT}`)
);
