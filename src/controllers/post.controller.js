const { response } = require("express");
const cloudinary = require("cloudinary");
const fs = require("fs-extra");
const Post = require("../models/Post.model");
const mongoose = require("mongoose");

const postObj = {};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * get posts
 */

postObj.getPosts = async (req, res = response) => {
  try {
    const posts = await Post.find();

    res.status(200).json({
      ok: true,
      msg: "Posts get successfully",
      posts,
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
postObj.createPost = async (req, res = response) => {
  const { uid } = req;

  try {
    if (!req.files || !req.files.image || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No files were uploaded",
      });
    }

    const file = req.files.image;

    if (file.size > 2000000) {
      return res.status(400).json({
        ok: false,
        msg: "Imagen demasiado grande",
      });
    }

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return res.status(400).json({
        ok: false,
        msg: "El formato de imagen es incorrecto",
      });
    }

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "social-network",
    });

    const post = new Post(req.body);
    post.imageUrl = result.secure_url;
    post.imageId = result.public_id;
    post.tags = req.body.tags.split(",");
    post.user = uid;

    const postSaved = await post.save();
    await fs.unlink(file.tempFilePath);

    return res.status(200).json({
      ok: true,
      msg: "Post created successfully",
      post: postSaved,
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
postObj.updatePost = async (req, res = response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        ok: false,
        msg: "Id not valid",
      });
    }

    const postSearch = await Post.findById(id);

    if (!postSearch) {
      return res.status(404).json({
        ok: false,
        msg: "This post not exist",
      });
    }

    if (!req.files || !req.files.image || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        ok: false,
        msg: "No files were uploaded",
      });
    }

    const file = req.files.image;

    if (file.size > 2000000) {
      return res.status(400).json({
        ok: false,
        msg: "Imagen demasiado grande",
      });
    }

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return res.status(400).json({
        ok: false,
        msg: "El formato de imagen es incorrecto",
      });
    }

    await cloudinary.v2.uploader.destroy(postSearch.imageId);

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "social-network",
    });

    const url = result.secure_url;
    const publicId = result.public_id;

    const post = await Post.findByIdAndUpdate(
      id,
      {
        imageUrl: url,
        imageId: publicId,
        tags: req.body.tags.split(","),
        ...req.body,
      },
      { new: true }
    );

    await fs.unlink(file.tempFilePath);

    return res.status(200).json({
      ok: true,
      msg: "Post updated successfully",
      post,
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
postObj.deletePost = async (req, res = response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        ok: false,
        msg: "Id not valid",
      });
    }

    const postSearch = await Post.findById(id);

    if (!postSearch) {
      return res.status(404).json({
        ok: false,
        msg: "This post not exist",
      });
    }

    await Post.findByIdAndDelete(id);
    await cloudinary.v2.uploader.destroy(postSearch.imageId);

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
