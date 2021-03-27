const rateLimit = require("express-rate-limit");
const { HttpCode } = require('./constants')

const accountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  handler: (req, res, next) => {
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      data: 'Forbidden',
      message: 'Too many registration requests, please try later',
    })
  }
});

module.exports = {
    accountLimiter
}