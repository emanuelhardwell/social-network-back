const { response } = require("express");

const postObj = {};

/**
 * get posts
 */

postObj.getPosts = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Posts get successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

/**
 * create post
 */
postObj.createPost = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Post created successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

/**
 * update post
 */
postObj.updatePost = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Post updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

/**
 * delete post
 */
postObj.deletePost = (req, res = response) => {
  try {
    res.status(200).json({
      ok: true,
      msg: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      msg: "Contacting the admin",
    });
    console.log(error);
  }
};

module.exports = postObj;
