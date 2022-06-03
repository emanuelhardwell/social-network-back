const { Router } = require("express");
const { validateJWT } = require("../middlewares/validate-jwt");

const {
  createUser,
  loginUser,
  renewToken,
} = require("../controllers/auth.controller");

const router = Router();

/**
 * API /api/v1/auth
 * @url /new
 * create user
 */
router.post("/new", createUser);

/**
 * API /api/v1/auth
 * @url /login
 * login user
 */
router.post("/login", loginUser);

/**
 * API /api/v1/auth
 * @url /renew
 * renew token
 */
router.get("/renew", validateJWT, renewToken);

module.exports = router;
