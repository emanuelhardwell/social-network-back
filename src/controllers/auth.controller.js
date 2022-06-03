const User = require("../models/User.model");
const { response } = require("express");

const authObj = {};

authObj.createUser = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

authObj.loginUser = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Login successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

authObj.renewToken = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Renew token successfully",
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
