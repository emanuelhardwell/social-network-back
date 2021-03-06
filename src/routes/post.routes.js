const { Router } = require("express");

const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostsBySearch,
  getPostsByPagination,
  getPostById,
  commentPost,
  deleteComment,
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
 * ******************** GET POST BY ID  ********************
 */
router.get("/post/:id", getPostById);

/**
 * ******************** GET POSTS BY SEARCH  ********************
 */
router.get("/search", getPostsBySearch);

/**
 * ******************** GET POSTS BY PAGINATION ********************
 */
router.get("/posts", getPostsByPagination);

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
 * ******************** LIKE POST  ********************
 */
router.put("/like/:id", likePost);

/**
 * ******************** COMMENT POST  ********************
 */
router.put("/comment/:id", commentPost);

/**
 * ******************** COMMENT DELETE  ********************
 */
router.delete("/comment/:id", deleteComment);

/**
 * ******************** DELETE POST  ********************
 */
router.delete("/:id", deletePost);

module.exports = router;
