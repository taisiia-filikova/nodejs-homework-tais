const jwt = require('jsonwebtoken');
const Users = require('../model/users');
const fs = require('fs').promises
const path=require('path')
const{promisify}=require('util')
const cloudinary = require('cloudinary').v2
const { nanoid } = require('nanoid')
require('dotenv').config()

const { HttpCode } = require('../helpers/constants');
const EmailService = require('../services/email')
const SECRET_KEY = process.env.JWT_SECRET;

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
  
});

const uploadCloud = promisify(cloudinary.uploader.upload)

const reg = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await Users.findByEmail(email)
    if (user) {
      return res.status(HttpCode.CONFLICT).json({
        status: 'error',
        code: HttpCode.CONFLICT,
        data: 'Conflict',
        message: 'Email is already use',
      })
    }
    const verifyToken = nanoid()
    const emailService = new EmailService(process.env.NODE_ENV)
    await emailService.sendEmail(verifyToken, email)
    const newUser = await Users.create({
      ...req.body,
      verify: false,
      verifyToken,
    })
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatar:newUser.avatar
      },
    })
  }  catch (e) {
    if (e.name === 'ValidationError' || e.name === 'MongoError') {
      return next({
        status: HttpCode.BAD_REQUEST,
        message: e.message.replace(/"/g, ''),
      });
    }
    next(e);
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await Users.findByEmail(email)
    const isValidPassword = await user?.validPassword(password)
    if (!user || !isValidPassword || !user.verify) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'error',
        code: HttpCode.UNAUTHORIZED,
        data: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      })
    }
    const id = user._id
    const payload = { id }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' })
    await Users.updateToken(id, token)
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        token,
      },
    })
  } catch (e) {
    next(e)
  }
}

const logout = async (req, res, next) => {
  const id = req.user.id
  await Users.updateToken(id, null)
  return res.status(HttpCode.NO_CONTENT).json({})
}

const getCurrentUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const user = await Users.findById(id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        email: user.email,
        subscription: user.subscription,
        avatar:user.avatar,
      },
    });
  } catch (e) {
    next(e);
  }
};

const avatars = async (req, res, next) => {
  try {
    const id = req.user.id
    // const avatarUrl=await saveAvatarToStatic(req)
    const {
      public_id: imgIdCloud,
      secure_url: avatarUrl
    } = await saveAvatarToCloud(req)
    await Users.updateAvatar(id, avatarUrl,imgIdCloud)
    return res.json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        avatarUrl,
      }}
    )
 } catch (error) {
    next(error)
  }
}

const saveAvatarToCloud = async (req) => {
  const pathFile = req.file.path
  const result = await uploadCloud(pathFile, {
    folder: 'images',
    transformation: {
      width: 250,
      height:250,
      crop: 'fill'
    }
  })
  cloudinary.uploader.destroy(req.user.imgIdCloud, (err, result) => {
  console.log(err,result);
})

  try {
    await fs.unlink(path.file)
  } catch (e) {
    console.log(e.message)
  }
  return result
}

const verify = async (req, res, next) => {
  try {
    const user = await Users.findByVerifyToken(req.params.verifyToken)
    if (user) {
      await Users.updateVerifyToken(user.id, true, null)
      return res.json({
        status: 'success',
        code: HttpCode.OK,
        message: 'Verification successful!',
      })
    }
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      data: 'Bad request',
      message: 'Link is not valid',
    })
  } catch (e) {
    next(e)
  }
}

module.exports = {
    reg,
    login,
    logout,
    getCurrentUser,
    avatars,
    verify
}