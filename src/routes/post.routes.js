const { Router } = require("express");

const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");
const { check } = require("express-validator");
const { validateInputs } = require("../middlewares/validate-inputs");
const { validateJWT } = require("../middlewares/validate-jwt");

const router = Router();

router.use(validateJWT);

router.get("/", getPosts);

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

router.put(
  "/:id",
  [
    check("title", "the title is required").notEmpty(),
    check("description", "the description is required").notEmpty(),
    check("image", "the image is required").notEmpty(),
    check("tags", "the tags is required").notEmpty(),
    validateInputs,
  ],
  updatePost
);

router.delete("/:id", deletePost);

module.exports = router;
