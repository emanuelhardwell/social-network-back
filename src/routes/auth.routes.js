const { Router } = require("express");
const { validateJWT } = require("../middlewares/validate-jwt");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validate-inputs");

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
router.post(
  "/new",
  [
    check("name", "the name is required").notEmpty(),
    check("lastname", "the lastname is required").notEmpty(),
    check("lastname2", "the lastname2 is required").notEmpty(),
    check("email", "the email is required").notEmpty(),
    check("password", "the password is required").isLength({ min: 6 }),
    validateInputs,
  ],
  createUser
);

/**
 * API /api/v1/auth
 * @url /login
 * login user
 */
router.post(
  "/login",
  [
    check("email", "the email is required").notEmpty(),
    check("password", "the password is required").isLength({ min: 6 }),
    validateInputs,
  ],
  loginUser
);

/**
 * API /api/v1/auth
 * @url /renew
 * renew token
 */
router.get("/renew", validateJWT, renewToken);

module.exports = router;
