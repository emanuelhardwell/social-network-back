const express = require("express");
const { dbConnection } = require("./db/db");
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const fileupload = require("express-fileupload");

const app = express();

// use of DB
dbConnection();

// cors
app.use(cors());

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(fileupload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// rutas
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/post", require("./routes/post.routes"));

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server running in the port ${process.env.PORT}`)
);
