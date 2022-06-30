const User = require("../models/User.model");
const { response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  handleErrorResponse,
  handleInternalServerError,
} = require("../helpers/handleError");

const authObj = {};

/**
 * ******************** CREATE USER  ********************
 */

authObj.createUser = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return handleErrorResponse(res, "Usuario no valido", 400);
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
    handleInternalServerError(res, error);
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
      return handleErrorResponse(res, "Usuario o contraseña icorrecta", 400);
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return handleErrorResponse(res, "Contraseña icorrecta", 400);
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
    handleInternalServerError(res, error);
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
    handleInternalServerError(res, error);
  }
};

module.exports = authObj;
