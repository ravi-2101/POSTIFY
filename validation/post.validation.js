const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

const commentSchema = Joi.object({
  text: Joi.string().trim().max(500).required(),

  commentedBy: JoiObjectId().required(),

  repliesToComment: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().max(500).required(),
        repliedBy: JoiObjectId().required(),
        repliedAt: Joi.date().default(() => new Date()),
      })
    )
    .default([]),

  likesToComment: Joi.array().items(JoiObjectId()).default([]),

  commentedAt: Joi.date().default(() => new Date()),
});



const postJoiSchema = Joi.object({
  title: Joi.string().required(),

  body: Joi.string().required(),

  postPhoto: Joi.string().optional(),

  postedBy: JoiObjectId(), 

  likes: Joi.array().items(JoiObjectId()),

  comments: Joi.array().items(commentSchema).default([]),
});


module.exports = postJoiSchema