const { createPost, getAllPost, getAllPostByOneUser, likeThePost, unlikeThePost, commentThePost, deleteTheCommentinPost, getAllCommentsOfOnePost, likesToCommentOfPost, unlikesToCommentOfPost, replyToCommentOfPost, deleteTheReplyToCommentOfPost } = require("../controller/post.controller");
const authorise = require('../middlewares/jwtAuth')
const router = require("express").Router();
const upload = require("../middlewares/multer")
const validate = require('../validation/validate');
const postJoiSchema = require('../validation/post.validation');


router.post('/createPost',authorise,upload.single("postPhoto"),validate(postJoiSchema),createPost);
router.get('/get',authorise,getAllPost);
router.get('/getOne',authorise,getAllPostByOneUser);
router.put('/likePost/:id',authorise,likeThePost); 
router.put('/unlikePost/:id',authorise,unlikeThePost); 
router.put('/commentPost/:postId',authorise,commentThePost); 
router.put('/uncommentPost/:postId/:commentId',authorise,deleteTheCommentinPost);
router.get("/getComments/:id",authorise,getAllCommentsOfOnePost); 
router.put("/likesTheComments/:postId/:commentId",authorise,likesToCommentOfPost); 
router.put("/unlikesTheComments/:postId/:commentId",authorise,unlikesToCommentOfPost); 
router.put("/replyTheComments/:postId/:commentId",authorise,replyToCommentOfPost); 
router.put("/unreplyTheComments/:postId/:commentId/:replyId",authorise,deleteTheReplyToCommentOfPost); 


module.exports = router;    