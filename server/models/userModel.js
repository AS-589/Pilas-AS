const {Schema, model} = require("mongoose")

const UserSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    profilePhoto: {type: String, default: "https://res.cloudinary.com/dy9lmjw4n/image/upload/v1747994874/Default-Icon_jsx5xq.jpg"},
    bio: {type: String, default: "Sin Bio"},
    followers: [{type: Schema.Types.ObjectId, ref: "User"}],
    following: [{type: Schema.Types.ObjectId, ref: "User"}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: "Post"}],
    posts: [{type: Schema.Types.ObjectId, ref: "Post"}],
}, {timestamps: true}
);

module.exports = model("User", UserSchema)