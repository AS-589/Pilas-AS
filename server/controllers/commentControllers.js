const HttpError = require("../models/errorModel")
const CommentModel = require('../models/commentModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')




const createComment = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const {comment} = req.body;
        if(!comment) {
            return next(new HttpError("Por favor, escribe un comentario", 422))
        }
        const commentCreator = await UserModel.findById(req.user.id)
        const newComment = await CommentModel.create({creator: {creatorId: req.user.id, creatorName: commentCreator?.fullName, creatorPhoto: commentCreator?.profilePhoto}, comment, postId})
        await PostModel.findByIdAndUpdate(postId, {$push: {comments: newComment?._id}}, {new: true})
        res.json(newComment)
    } catch (error) {
        return next(new HttpError)
    }
}


const getPostComments = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const comments = await PostModel.findById(postId).populate({path: "comments", options: {sort: {createdAt: -1}}});
        res.json(comments)
        if (!comments) {
        return next(new HttpError("Commentarios no encontrados", 404));
}
    } catch (error) {
        return next(new HttpError);
}
}


const deleteComment = async (req, res, next) => {
    try {
        const {commentId} = req.params;
        const comment = await CommentModel.findById(commentId);
        const commentCreator = await UserModel.findById(comment?.creator?.creatorId);
        if(commentCreator?._id != req.user.id) {
            return next(new HttpError("Acción no autorizada", 403))
        } 
        await PostModel.findByIdAndUpdate(comment?.postId, {$pull: {comments: commentId}})
        const deletedComment = await CommentModel.findByIdAndDelete(commentId)
        res.json(deletedComment)

    } catch (error) {
        return next(new HttpError)
    }
}





module.exports = {createComment, getPostComments, deleteComment}