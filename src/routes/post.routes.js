const { Router } = require("express");

const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require("../controllers/post.controller");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validate-inputs");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

router.use(validateJWT);

/**
 * GET
 */
router.get("/", getPosts);

/**
 * POST
 */
router.post(
  "/",
  [
    check("title", "the title is required").notEmpty(),
    check("description", "the description is required").notEmpty(),
    check("tags", "the tags is required").notEmpty(),
    validateInputs,
  ],
  createPost
);

/**
 * PUT
 */
router.put(
  "/:id",
  [
    check("title", "the title is required").notEmpty(),
    check("description", "the description is required").notEmpty(),
    check("tags", "the tags is required").notEmpty(),
    validateInputs,
  ],
  updatePost
);

/**
 * PUT LIKE
 */
router.put("/like/:id", likePost);

/**
 * DELETE
 */
router.delete("/:id", deletePost);

module.exports = router;
