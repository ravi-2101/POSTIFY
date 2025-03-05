const mongoose = require("mongoose");

const commentSchema = {
  text: {
    type: String,
  },
  commentedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  repliesToComment: [
    {
      text: {
        type: String,
      },
      repliedBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
      repliedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  likesToComment: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  commentedAt : {
    type : Date,
    default : Date.now()
  }
};


const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    postPhoto: {
      type: String,
      valid: ["image/jpeg", "image/png"],
      required: true,
    },
    postedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
        commentSchema
    ],
  },
  { timestamps: true, versionKey: false }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
