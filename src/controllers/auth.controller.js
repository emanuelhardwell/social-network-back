const User = require("../models/User.model");
const { response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = authObj;
