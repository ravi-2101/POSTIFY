const { default: mongoose } = require("mongoose");
const Post = require("../model/post.model");

const createPost = async (req, res) => {
  try {
    // get data
    const { title, body } = req.body;
    let postPhoto;
    if (req.file.filename) {
      postPhoto = req?.file ? req.file.filename : null;
    }

    // validation
    if (!title || !body || !postPhoto) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });
    }

    // create post
    const posts = await Post.create({
      title,
      body,
      postPhoto,
      postedBy: req?.user?._id,
    });

    // response
    return res.status(201).json({
      status: true,
      data: posts,
      message: "Post posted successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getAllPost = async (req, res) => {
  try {
    const post = await Post.find().select("-_id -createdAt -updatedAt");

    return res.status(200).json({
      status: true,
      data: post,
      message: "post retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getAllPostByOneUser = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.user?._id }).populate(
      "postedBy",
      "-password"
    );

    return res.status(200).json({
      status: true,
      data: posts,
      message: "Posts retrieved successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const likeThePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    if (post.likes.includes(userId)) {
      return res
        .status(404)
        .json({ status: false, message: "You already like the post!" });
    } else {
      post.likes.push(userId);
    }
    await post.save();

    return res.status(200).json({
      status: true,
      data: post.likes.length,
      message: "Likes added to post!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const unlikeThePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id).select("likes");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
      await post.save();
    } else {
      return res
        .status(404)
        .json({ status: false, message: "You already unlike the post!" });
    }

    return res.status(200).json({
      status: true,
      data: post.likes.length,
      message: "Like remove from the  post!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const commentThePost = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user?._id;
    const postId = req.params?.postId;
    const post = await Post.findByIdAndUpdate(
      { _id: postId },
      { $push: { comments: { text, commentedBy: userId } } },
      { new: true }
    );

    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    if (!userId) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // comment = {
    //   text,
    //   commentBy: user.userName,
    // };

    // post.comments.push(comment);
    // await post.save();

    return res.status(200).json({
      status: true,
      data: { post: post, totalComments: post.comments.length },
      message: "You commented the post!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteTheCommentinPost = async (req, res) => {
  try {
    // find the post
    const {postId, commentId }= req.params;
    const userId = req?.user?._id;

    const post = await Post.findById(postId).select("comments postedBy");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    // find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ status: false, message: "Comment not found!" });
    }

    // verify postedBy and commentedBy
    const postedby = post?.postedBy.toString();

    if (userId !== comment.commentBy && userId !== postedby) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized to delete this comment",
      });
    }

    // delete the comment
    post.comments.pull(comment);
    await post.save();

    // response
    return res.status(200).json({
      status: true,
      data: { totalComments: post.comments.length },
      message: "You deleted the commented from the post successfully!!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getAllCommentsOfOnePost = async (req, res) => {
  try {
    const commentId = new mongoose.Types.ObjectId(req.params?.id);
    const post = await Post.aggregate([
      {
        $match: {
          _id: commentId,
        },
      },
      {
        $unwind: "$comments",
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.commentedBy",
          foreignField: "_id",
          as: "commentedUser",
        },
      },
      {
        $unwind: "$commentedUser",
      },
      {
        $group: {
          _id: "$_id",
          comments: {
            $push: {
              text: "$comments.text",
              username: "$commentedUser.userName",
            },
          },
          totalComments: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          comments: 1,
          totalComments: 1,
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      data: post,
      message: "Comments retreived successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const likesToCommentOfPost = async (req, res) => {
  try {
    const {commentId, postId} = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(postId).select("comments");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    // find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ status: false, message: "Comment not found!" });
    }

    const like = comment.likesToComment.includes(userId);

    if (like) {
      return res
        .status(400)
        .json({ status: false, message: "You already like the comment!" });
    } 
      comment.likesToComment.push(userId);
    
    await post.save();

    return res.status(200).json({
      status: true,
      data: { totalLikesOfComments: comment.likesToComment.length },
      message: "You like the comment successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const unlikesToCommentOfPost = async (req, res) => {
  try {
    const {postId, commentId} = req.params;
    const likeId = req.user?._id ; 
    
    const post = await Post.findById(postId).select("comments");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    // find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ status: false, message: "Comment not found!" });
    }

    const like = comment.likesToComment.includes(likeId);
    if (like) {
      comment.likesToComment.pull(likeId);
    } else {
      return res
        .status(404)
        .json({ status: false, message: "You already unlike the comment!" });
    }
    await post.save();

    return res.status(200).json({
      status: true,
      data: { totalLikesOfComments: comment.likesToComment.length },
      message: "You unlike the comment successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const replyToCommentOfPost = async (req, res) => {
  try {
    const {commentId, postId} = req.params;
    const { text } = req.body;
    const userId = req.user?._id;

    const post = await Post.findById(postId).select("comments");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    // find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ status: false, message: "Comment not found!" });
    }

    const reply = {
      text,
      repliedBy: userId,
    };

    comment.repliesToComment.push(reply);
    await post.save();

    return res.status(200).json({
      status: true,
      data: {
        comment: comment.repliesToComment,
        totalReplies: comment.repliesToComment.length,
      },
      message: "You replied to the comment succesfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const deleteTheReplyToCommentOfPost = async (req, res) => {
  try {
    const {postId, commentId, replyId} = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(postId).select("comments postedBy");
    if (!post) {
      return res
        .status(400)
        .json({ status: false, message: "Post not available" });
    }

    // find the comment
    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ status: false, message: "Comment not found!" });
    }

    const reply = comment.repliesToComment.find((r) => r._id.toString() === replyId);
    if (!reply) {
      return res.status(404).json({ status: false, message: "Reply not found!" });
    }

    

    const postedBy = post?.postedBy.toString();
    const repliedby = reply.repliedBy.toString();
    
    if (userId !== repliedby && userId !== postedBy) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized to delete this reply",
      });
    }

    comment.repliesToComment.pull(reply);

    await post.save();

    return res.status(200).json({
      status: true,
      data: {
        replies: comment.repliesToComment,
        totalReplyOfComments: comment.repliesToComment.length,
      },
      message: "You delete the reply to  the comment successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getAllPost,
  getAllPostByOneUser,
  likeThePost,
  unlikeThePost,
  commentThePost,
  deleteTheCommentinPost,
  getAllCommentsOfOnePost,
  likesToCommentOfPost,
  unlikesToCommentOfPost,
  replyToCommentOfPost,
  deleteTheReplyToCommentOfPost,
};
