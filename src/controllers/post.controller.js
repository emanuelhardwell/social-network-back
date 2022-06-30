const { response } = require("express");
const cloudinary = require("cloudinary");
const fs = require("fs-extra");
const Post = require("../models/Post.model");
const mongoose = require("mongoose");
const {
  handleErrorResponse,
  handleInternalServerError,
} = require("../helpers/handleError");

const postObj = {};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * ******************** GET POST BY ID  ********************
 */
postObj.getPostById = async (req, res = response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const postSearch = await Post.findById(id)
      .populate({
        path: "user",
        select: "name lastname",
      })
      .populate({
        path: "comments.user",
        select: "name lastname",
      });

    if (!postSearch) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    res.status(200).json({
      ok: true,
      msg: "Publicación obtenida",
      post: postSearch,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** GET POSTS  ********************
 */
postObj.getPosts = async (req, res = response) => {
  try {
    const posts = await Post.find().populate({
      path: "user",
      select: "name",
    });

    res.status(200).json({
      ok: true,
      msg: "Publicaciones obtenidas",
      posts,
    });
  } catch (error) {
    handleInternalServerError(res, error);
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
      }).populate({
        path: "user",
        select: "name",
      });
    } else {
      posts = await Post.find({
        $or: [{ title }],
      }).populate({
        path: "user",
        select: "name",
      });
    }

    res.status(200).json({
      ok: true,
      msg: "Publicaciones por busqueda obtenidas ",
      posts,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** GET POSTS BY PAGINATION ********************
 */
postObj.getPostsByPagination = async (req, res = response) => {
  let { page } = req.query;

  if (page === undefined || page === "" || page == 0) {
    page = 1;
  }

  try {
    const posts = await Post.countDocuments();

    const LIMIT = 4;
    const startIndex = (Number(page) - 1) * LIMIT;
    const numberOfPages = Math.ceil(posts / LIMIT);

    const postsGet = await Post.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)
      .populate({
        path: "user",
        select: "name",
      });

    res.status(200).json({
      ok: true,
      msg: "Publicaciones por paginación obtenidas",
      posts: postsGet,
      currentPage: Number(page),
      numberOfPages,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** CREATE POST  ********************
 */
postObj.createPost = async (req, res = response) => {
  const { uid } = req;

  try {
    if (!req.files || !req.files.image || Object.keys(req.files).length === 0) {
      return handleErrorResponse(res, "Imagen no cargada", 400);
    }

    const file = req.files.image;

    if (file.size > 2000000) {
      return handleErrorResponse(res, "Imagen demasiado grande", 400);
    }

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return handleErrorResponse(
        res,
        "Formato de imagen no valido, unicamente se aceptan jpeg, jpg, png",
        400
      );
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
    const postPopulate = await Post.findById(postSaved._id).populate({
      path: "user",
      select: "name",
    });
    await fs.unlink(file.tempFilePath);

    return res.status(200).json({
      ok: true,
      msg: "Publicación creada",
      post: postPopulate,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** UPDATE POST  ********************
 */
postObj.updatePost = async (req, res = response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const postSearch = await Post.findById(id);

    if (!postSearch) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    if (!req.files || !req.files.image || Object.keys(req.files).length === 0) {
      return handleErrorResponse(res, "Imagen no seleccionada", 400);
    }

    const file = req.files.image;

    if (file.size > 2000000) {
      return handleErrorResponse(res, "Imagen demasiado grande", 400);
    }

    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return handleErrorResponse(
        res,
        "Formato de imagen no valido, unicamente se aceptan jpeg, jpg, png",
        400
      );
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
    ).populate({
      path: "user",
      select: "name",
    });

    await fs.unlink(file.tempFilePath);

    return res.status(200).json({
      ok: true,
      msg: "Publicación actualizada",
      post,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** DELETE POST  ********************
 */
postObj.deletePost = async (req, res = response) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const postSearch = await Post.findById(id);

    if (!postSearch) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    await Post.findByIdAndDelete(id);
    await cloudinary.v2.uploader.destroy(postSearch.imageId);

    res.status(200).json({
      ok: true,
      msg: "Publicación borrada",
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** COMMENT DELETE  ********************
 */
postObj.deleteComment = async (req, res = response) => {
  const { idPost } = req.query;
  const { idComment } = req.query;

  try {
    if (
      !mongoose.Types.ObjectId.isValid(idPost) ||
      !mongoose.Types.ObjectId.isValid(idComment)
    ) {
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const postSearch = await Post.findById(idPost);

    if (!postSearch) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    const comments = postSearch.comments.filter(
      (comment) => String(comment._id) !== idComment
    );

    const post = await Post.findByIdAndUpdate(
      idPost,
      { comments },
      { new: true }
    )
      .populate({
        path: "user",
        select: "name lastname",
      })
      .populate({
        path: "comments.user",
        select: "name lastname",
      });

    res.status(200).json({
      ok: true,
      msg: "Comentario borrado",
      post,
    });
  } catch (error) {
    handleInternalServerError(res, error);
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
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const post = await Post.findById(id);

    if (!post) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    const index = post.likes.findIndex((id) => String(id) === uid);

    if (index === -1) {
      post.likes.push(uid);
    } else {
      post.likes = post.likes.filter((id) => String(id) !== uid);
    }

    const postUpdated = await Post.findByIdAndUpdate(id, post, {
      new: true,
    }).populate({
      path: "user",
      select: "name",
    });

    res.status(200).json({
      ok: true,
      msg: "Te a gustado esta publicación",
      post: postUpdated,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

/**
 * ******************** COMMENT POST  ********************
 */
postObj.commentPost = async (req, res = response) => {
  const { id } = req.params;
  const uid = req.uid;
  const { comment } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleErrorResponse(res, "Id no valido", 404);
    }

    const post = await Post.findById(id);

    if (!post) {
      return handleErrorResponse(res, "Esta publicación no existe", 404);
    }

    // const index = post.likes.findIndex((id) => String(id) === uid);

    // if (index === -1) {
    post.comments.push({ user: uid, comment });
    // } else {
    //   post.likes = post.likes.filter((id) => String(id) !== uid);
    // }

    const postUpdated = await Post.findByIdAndUpdate(id, post, {
      new: true,
    })
      .populate({
        path: "user",
        select: "name lastname",
      })
      .populate({
        path: "comments.user",
        select: "name lastname",
      });

    res.status(200).json({
      ok: true,
      msg: "Has comentado esta publicación",
      post: postUpdated,
    });
  } catch (error) {
    handleInternalServerError(res, error);
  }
};

module.exports = postObj;
