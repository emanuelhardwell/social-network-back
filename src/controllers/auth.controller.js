const User = require("../models/User.model");
const { response } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authObj = {};

authObj.createUser = async (req, res = response) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        ok: false,
        msg: "User is not available",
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
      msg: "User created successfully",
      uid: userSaved._id,
      name: userSaved.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

authObj.loginUser = async (req, res = response) => {
  const { password, email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        ok: false,
        msg: "User not found",
      });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(400).json({
        ok: false,
        msg: "Password don´t match",
      });
    }

    const token = await jwt.sign(
      { uid: user._id, name: user.name },
      process.env.SECRET_JWT,
      { expiresIn: "6h" }
    );

    res.status(200).json({
      ok: true,
      msg: "Login successfully",
      uid: user._id,
      name: user.name,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

authObj.renewToken = async (req, res = response) => {
  const { uid, name } = req;

  try {
    const token = await jwt.sign({ uid, name }, process.env.SECRET_JWT, {
      expiresIn: "6h",
    });

    res.status(200).json({
      ok: true,
      msg: "Renew token successfully",
      name,
      uid,
      token,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

module.exports = authObj;
