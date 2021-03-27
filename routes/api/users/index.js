const express = require('express')
const router = express.Router()
const usersController = require('../../../controllers/usersControllers')
const guard = require('../../../helpers/guard');
const upload = require('../../../helpers/upload')
const {validateUploadAvatar} =require('./validation')
const {accountLimiter} =require('../../../helpers/rateLimit')

router.post('/register',accountLimiter,usersController.reg)
router.post('/login',usersController.login)
router.post('/logout', guard, usersController.logout)
router.get('/current',guard, usersController.getCurrentUser);
router.patch('/avatars', [guard , upload.single('avatar'),validateUploadAvatar] , usersController.avatars)

module.exports = router
