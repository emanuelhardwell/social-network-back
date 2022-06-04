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
 * ******************** GET POSTS  ********************
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
 * ******************** GET POSTS BY SEARCH  ********************
 */
postObj.getPostsBySearch = async (req, res = response) => {
  let { searchQuery, tags } = req.query;

  let title = new RegExp(searchQuery, "i");

  try {
    let posts;
    if (!searchQuery || searchQuery === "") {
      title = "";
    }

    if (tags) {
      tags = tags.toLowerCase();
      posts = await Post.find({
        $or: [{ title }, { tags: { $in: tags.split(",") } }],
      });
    } else {
      posts = await Post.find({
        $or: [{ title }],
      });
    }

    res.status(200).json({
      ok: true,
      msg: "Posts search get successfully",
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
 * ******************** GET POSTS BY PAGINATION ********************
 */
postObj.getPostsByPagination = async (req, res = response) => {
  const { page } = req.query;

  try {
    const posts = await Post.countDocuments();

    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT;
    const numberOfPages = Math.ceil(posts / LIMIT);

    const postsGet = await Post.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.status(200).json({
      ok: true,
      msg: "Posts pagination get successfully",
      posts: postsGet,
      currentPage: Number(page),
      numberOfPages,
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
 * ******************** CREATE POST  ********************
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
 * ******************** UPDATE POST  ********************
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
        ...req.body,
        imageUrl: url,
        imageId: publicId,
        tags: req.body.tags.split(","),
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
 * ******************** DELETE POST  ********************
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

/**
 * ******************** LIKE POST  ********************
 */
postObj.likePost = async (req, res = response) => {
  const { id } = req.params;
  const uid = req.uid;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        ok: false,
        msg: "Id not valid",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        ok: false,
        msg: "This post not exist",
      });
    }

    const index = post.likes.findIndex((id) => String(id) === uid);

    if (index === -1) {
      post.likes.push(uid);
    } else {
      post.likes = post.likes.filter((id) => String(id) !== uid);
    }

    const postUpdated = await Post.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(200).json({
      ok: true,
      msg: "Post like+ successfully",
      post: postUpdated,
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
