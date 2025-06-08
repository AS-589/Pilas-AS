const HttpError = require('../models/errorModel')
const UserModel = require('../models/userModel')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const uuid = require("uuid").v4;
const fs = require("fs")
const path = require("path")
const cloudinary = require("../utils/cloudinary")


const registerUser = async (req, res, next) => {
    try {
        const {fullName, email, password, confirmPassword} = req.body;
        if(!fullName || !email || !password || !confirmPassword) {
            return next(new HttpError("Completa todas las areas", 422))
        }
        const lowerCasedEmail = email.toLowerCase();

        const emailExists = await UserModel.findOne({email: lowerCasedEmail})
        if(emailExists) {
            return next(new HttpError("Correo ya registrado", 422))
        }

        if(password != confirmPassword) {
            return next(new HttpError("La contraseña no coincide", 422))
        }

        if(password.length < 6) {
            return next(new HttpError("la contraseña debe contener minimum 6 cáracteres", 422))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await UserModel.create({fullName, email: lowerCasedEmail, password: hashedPassword})
        res.json(newUser).status(201);


    } catch (error) {
        return next(new HttpError(error))
    }
};



const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Completa todas las areas", 422))
        }
        const lowerCasedEmail = email.toLowerCase();

        const user = await UserModel.findOne({email: lowerCasedEmail})
        if(!user) {
            return next(new HttpError("Datos inválidos", 422))
        }

        const comparedPass = await bcrypt.compare(password, user?.password);
        if(!comparedPass) {
            return next(new HttpError("Datos incorrectos"), 422)
        }
        const token = await jwt.sign({id: user?._id}, process.env.JWT_SECRET, {expiresIn: "1H"})
        res.json({token, id: user?._id}).status(200)
        
    } catch (error) {
        return next(new HttpError(error))
    }
};



const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await UserModel.findById(id).select('-password')
        if(!user) {
            return next(new HttpError("Perfil no encontrado", 404))
        }
        res.json(user).status(200)
    } catch (error) {
        return next(new HttpError(error))
    }
};


const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().limit(10).sort({createdAt: -1})
        res.json(users).status(200);
    } catch (error) {
        return next(new HttpError(error))
    }
};


const editUser = async (req, res, next) => {
    try {
        const {fullName, bio} = req.body;
        const editedUser = await UserModel.findByIdAndUpdate(req.user.id, {fullName, bio}, {new: true})
        res.json(editedUser).status(200)
    } catch (error) {
        return next(new HttpError(error))
    }
};


const followUnfollowUser = async (req, res, next) => {
    try {
        const userToFollowId = req.params.id;
        if(req.user.id == userToFollowId) {
            return next(new HttpError("Acción no permitida", 422))
        }
        const currentUser = await UserModel.findById(req.user.id);
        const isFollowing = currentUser?.following?.includes(userToFollowId);

        if(!isFollowing){
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, {$push: {followers: req.user.id}}, {new: true})
            await UserModel.findByIdAndUpdate(req.user.id, {$push: {following: userToFollowId}}, {new: true})
            res.json(updatedUser)
        } else {
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, {$pull: {followers: req.user.id}}, {new: true})
            await UserModel.findByIdAndUpdate(req.user.id, {$pull: {following: userToFollowId}}, {new: true})
            res.json(updatedUser)
        }
        
    } catch (error) {
        return next(new HttpError(error))
    }
};



const changeUserAvatar = async (req, res, next) => {
    try {

        if(!req.files.avatar){
            return next(new HttpError("Elige una imagen", 422))
        }
        const {avatar} = req.files;
        if(avatar.size > 1000000) {
            return next(new HttpError("¡Uuups! La imagen de perfil es demasiado grande. No debería superar 1mb.", 401))
        }

        let fileName = avatar.name;
        let splittedFilename = fileName.split(".")
        let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
        avatar.mv(path.join(__dirname, "..", "uploads", newFilename), async (err) => {
            if(err) {
                return next(new HttpError(err))
            }

            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFilename))
            if(!result.secure_url) {
                return next(new HttpError("Error al descaragar la imagen en Cloudinary", 422))
            }
            const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, {profilePhoto: result?.secure_url}, {new: true})
            res.json(updatedUser).status(200)
        })

    } catch (error) {
        return next(new HttpError(error))
    }
};


module.exports = {registerUser, loginUser, getUser, getUsers, editUser, followUnfollowUser, changeUserAvatar}