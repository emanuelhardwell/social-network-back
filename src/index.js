const express = require("express");
const { dbConnection } = require("./db/db");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// use of DB
dbConnection();

// cors
app.use(cors());
app.use(morgan("dev"));

// middlewares
app.use(express.json());

// rutas
app.use("/api/v1/auth", require("./routes/auth.routes"));

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server running in the port ${process.env.PORT}`)
);
