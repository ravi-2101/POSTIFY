const router = require('express').Router();
const upload = require('../middlewares/multer')
const  { userRegistration, userLogin, getUser } = require('../controller/user.controller');
const authorise = require('../middlewares/jwtAuth');
const validate = require('../validation/validate');
const registerJoiSchema = require('../validation/userRegistration.validation');
const loginJoiSchema = require('../validation/login.validation');


router.post('/register',upload.single("profile"),validate(registerJoiSchema),userRegistration);
router.post('/login',validate(loginJoiSchema),userLogin);
router.get('/get',authorise,getUser);



module.exports = router;