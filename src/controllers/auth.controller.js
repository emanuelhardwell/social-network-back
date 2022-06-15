const User = require("../models/User.model");
const { response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const {
  MongoTransferer,
  MongoDBDuplexConnector,
  LocalFileSystemDuplexConnector,
} = require("mongodb-snapshot");

const authObj = {};

/**
 * ******************** CREATE USER  ********************
 */

authObj.createUser = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario no valido",
      });
    }

    user = new User(req.body);
    user.password = await bcrypt.hash(password, 10);
    const userSaved = await user.save();

    const token = await jwt.sign(
      { uid: userSaved._id, name: userSaved.name },
      process.env.SECRET_JWT,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      ok: true,
      msg: "Usuario creado",
      uid: userSaved._id,
      name: userSaved.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al administrador",
    });
    console.log(error);
  }
};

/**
 * ******************** LOGIN USER  ********************
 */
authObj.loginUser = async (req, res = response) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña icorrecta",
      });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({
        ok: false,
        msg: "Contraseña icorrecta",
      });
    }

    const token = await jwt.sign(
      { uid: user._id, name: user.name },
      process.env.SECRET_JWT,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      ok: true,
      msg: "Inicio de sesión correcto",
      uid: user._id,
      name: user.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al administrador",
    });
    console.log(error);
  }
};

/**
 * ******************** RENEW TOKEN USER  ********************
 */
authObj.renewToken = async (req, res = response) => {
  const { uid, name } = req;

  try {
    const token = await jwt.sign({ uid, name }, process.env.SECRET_JWT, {
      expiresIn: "6h",
    });

    res.status(200).json({
      ok: true,
      msg: "El token a sido renovado",
      name,
      uid,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al administrador",
    });
    console.log(error);
  }
};

/**
 * ******************** BACKUP  ********************
 */
authObj.backup = async (req, res = response) => {
  try {
    await dumpMongo2Localfile("backup");

    res.download(
      path.join(__dirname, "../backup/backup.tar"),
      function (error) {
        console.log("Error : ", error);

        if (error) {
          return res.status(404).json({
            ok: false,
            msg: "No se puede hacer el respaldo de la Base de Datos",
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al administrador",
    });
    console.log(error);
  }
};

/**
 * ******************** RESTORE  ********************
 */
authObj.restore = async (req, res = response) => {
  try {
    await dumpMongo2Localfile("restore");

    res.status(200).json({
      ok: true,
      msg: "La base de datos se restauro",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacte al administrador",
    });
    console.log(error);
  }
};

async function dumpMongo2Localfile(tipo) {
  const mongo_connector = new MongoDBDuplexConnector({
    connection: {
      uri: process.env.DB_CNN2,
      dbname: process.env.DB_CNN3,
    },
  });

  const localfile_connector = new LocalFileSystemDuplexConnector({
    connection: {
      path: path.join(__dirname, "../backup/backup.tar"),
      // path: "./backup.tar",
    },
  });

  let transferer;

  if (tipo === "backup") {
    transferer = new MongoTransferer({
      source: mongo_connector,
      targets: [localfile_connector],
    });
  }

  if (tipo === "restore") {
    transferer = new MongoTransferer({
      source: localfile_connector,
      targets: [mongo_connector],
    });
  }

  for await (const { total, write } of transferer) {
    console.log(`remaining bytes to write: ${total - write}`);
  }
}

module.exports = authObj;
