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

//  API -----> /api/v1/auth

/**
 * ******************** CREATE USER  ********************
 */
router.post(
  "/new",
  [
    check("name", "El nombre es obligatorio").notEmpty(),
    check("lastname", "El apellido paterno es obligatorio").notEmpty(),
    check("lastname2", "El apellido materno es obligatorio").notEmpty(),
    check("email", "El correo es obligatorio").notEmpty(),
    check(
      "password",
      "La contraseña es obligatoria y debe ser mayor o igual a 6 caracteres"
    ).isLength({ min: 6 }),
    validateInputs,
  ],
  createUser
);

/**
 * ******************** LOGIN USER  ********************
 */
router.post(
  "/login",
  [
    check("email", "El correo es obligatorio").notEmpty(),
    check(
      "password",
      "La contraseña es obligatoria y debe ser mayor o igual a 6 caracteres"
    ).isLength({ min: 6 }),
    validateInputs,
  ],
  loginUser
);

/**
 * ******************** RENEW TOKEN USER  ********************
 */
router.get("/renew", validateJWT, renewToken);

module.exports = router;
