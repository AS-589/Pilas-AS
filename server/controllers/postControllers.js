const HttpError = require('../models/errorModel');
const PostModel = require('../models/postModel');
const UserModel = require('../models/userModel');

const { v4: uuid } = require('uuid');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path'); 

const createPost = async (req, res, next) => {
  try {
    const { body, genre, locationName, date} = req.body;
    if (!body || !genre || !date ||!locationName) {
      return next(new HttpError("Por favor completa todos los campos", 422));
    }
    if (!req.files?.image) {
      return next(new HttpError("Por favor elige una imagen", 422));
    }
    const { image } = req.files;
    if (image.size > 1000000) {
      return next(new HttpError("La imagen es demasiado grande. No debería exceder 1MB", 422));
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return next(new HttpError("La fecha proporcionada no es válida", 422));
    }

    let fileName = image.name;
    fileName = fileName.split(".");
    fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
    await image.mv(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
      if (err) {
        return next(new HttpError(err));
      }
      const result = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', fileName), { resource_type: "image" });
      if (!result.secure_url) {
        return next(new HttpError("No se pudo descargar la imagen en Cloudinary", 422));
      }
      const newPost = await PostModel.create({
        creator: req.user.id,
        body,
        image: result.secure_url,
        genre,
        location: {name: locationName},
        date: parsedDate.getTime()
      });
      await UserModel.findByIdAndUpdate(newPost?.creator, {$push: {posts: newPost?._id} });
      res.json(newPost);
    });
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id)
      .populate("creator")
      .populate({ path: "comments", options: { sort: { createdAt: -1 }}});
    res.json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error.message));
  }
};

const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { body, genre, locationName, date } = req.body;
    const post = await PostModel.findById(postId);
    if (post?.creator != req.user.id) {
      return next(new HttpError("No puedes editar un post si no eres el creador", 403));
    }
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        body,
        genre, 
        location: { name: locationName }, 
        date: new Date(date).getTime()
      },
      {new: true}
    );
    res.json(updatedPost).status(200)
  } catch (error) {
    return next(new HttpError(error.message));
  }
};

const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (post?.creator != req.user.id) {
      return next(new HttpError("No puedes borrar un post si no eres el creador", 403));
    }
    const deletedPost = await PostModel.findByIdAndDelete(postId);
    await UserModel.findByIdAndUpdate(post?.creator, {$pull: {posts: post?._id}});
    res.json(deletedPost).status(200)
  } catch (err) {
    return next(new HttpError(err));
  }
};

const likeDislikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id);
    let updatedPost;
    if (post?.likes.includes(req.user.id)) {
      updatedPost = await PostModel.findByIdAndUpdate(id, {$pull: {likes: req.user.id}}, {new: true});
    } else {
      updatedPost = await PostModel.findByIdAndUpdate(id, {$push: {likes: req.user.id}}, {new: true});
    }
    res.json(updatedPost);
  } catch (error) {
    return next(new HttpError(error.message));
  }
};

const getFollowingPosts = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const posts = await PostModel.find({ creator: { $in: user?.following } })
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const posts = await UserModel.findById(userId)
      .populate({ path: "posts", options: {sort: {createdAt : -1}}});
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const createBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(req.user.id);
    const postIsBookmarked = user?.bookmarks?.includes(id);
    let userBookmarks;
    if (postIsBookmarked) {
      userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$pull:{bookmarks: id}}, {new: true});
    } else {
      userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$push: {bookmarks: id}}, {new: true});
    }
    res.json(userBookmarks);
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

const getUserBookmarks = async (req, res, next) => {
  try {
    const userBookmarks = await UserModel.findById(req.user.id)
      .populate({ path: "bookmarks", options: { sort: { date: -1 } } });
    res.json(userBookmarks);
  } catch (err) {
    return next(new HttpError(err.message));
  }
};

const filterPosts = async (req, res, next) => {
  try {
    const { genre } = req.query;
    console.log('Paramètres reçus pour filterPosts:', { genre, url: req.originalUrl });

    if (req.params && Object.keys(req.params).length > 0) {
      return next(new HttpError("URL inválida", 400));
    }

    let query = {};
    let sort = { date: -1 }; 

    if (genre && genre !== 'todo') {
      query.genre = genre;
    }

    const posts = await PostModel.find(query)
      .populate("creator", "fullName profilePhoto")
      .sort(sort);

    res.status(200).json(posts);
  } catch (error) {
    console.error(error.message, error.stack);
    return next(new HttpError(`Error : ${error.message}`, 500));
  }
};


module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  getUserBookmarks,
  createBookmark,
  likeDislikePost,
  getFollowingPosts,
  filterPosts
};