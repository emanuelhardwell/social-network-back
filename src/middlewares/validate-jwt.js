const { response } = require("express");
const jwt = require("jsonwebtoken");

const validateJWT = async (req = response, res, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(400).json({
      ok: false,
      msg: "Token not found in the request",
    });
  }

  try {
    const tokenVerify = await jwt.verify(token, process.env.SECRET_JWT);

    req.uid = tokenVerify.uid;
    req.name = tokenVerify.name;

    next();
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Token invalid o expired",
    });
    console.log(error);
  }
};

module.exports = { validateJWT };
