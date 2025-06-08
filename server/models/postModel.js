const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: "User"},
  body: { type: String, required: true },
  image: { type: String, required: true },
  genre: {
    type: String,
    enum: [
      "musica",
      "teatro",
      "exposición",
      "gastronomía",
      "deporte",
      "desarrollo sostenible",
      "artes plásticas",
      "visitas",
      "bienestar",
      "cultura",
      "fiesta local"
    ],
    required: true
  },
  location: {
    name: { type: String, required: true },
  },
  date: { type: Number, required: true }, 
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }]
}, {timestamps: true}
);

module.exports = model("Post", postSchema);