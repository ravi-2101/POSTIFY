const router = require('express').Router();
const user = require('./user.routes')
const post = require('./post.routes')

router.use('/user',user);
router.use('/post',post)

module.exports = router;