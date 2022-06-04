const { Router } = require("express");

const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostsPaginate,
} = require("../controllers/post.controller");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validate-inputs");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

router.use(validateJWT);

// API -----> /api/v1/post

/**
 * ******************** GET POSTS  ********************
 */
router.get("/", getPosts);

/**
 * ******************** GET POSTS PAGINATE ********************
 */
router.get("/posts", getPostsPaginate);

/**
 * ******************** CREATE POST  ********************
 */
router.post(
  "/",
  [
    check("title", "El titulo es obligatorio").notEmpty(),
    check("description", "La descripción es obligatoria").notEmpty(),
    check("tags", "Los tags son obligatorios").notEmpty(),
    validateInputs,
  ],
  createPost
);

/**
 * ******************** UPDATE POST  ********************
 */
router.put(
  "/:id",
  [
    check("title", "El titulo es obligatorio").notEmpty(),
    check("description", "La descripción es obligatoria").notEmpty(),
    check("tags", "Los tags son obligatorios").notEmpty(),
    validateInputs,
  ],
  updatePost
);

/**
 * ******************** UPDATE POST  ********************
 */
router.put("/like/:id", likePost);

/**
 * ******************** DELETE POST  ********************
 */
router.delete("/:id", deletePost);

module.exports = router;
