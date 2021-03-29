const User = require('./schemas/user')

const findByEmail = async (email) => {
    return await User.findOne({email})
}
const findById = async (id) => {
    return await User.findOne({_id:id})
}

const create = async ({ email, password, verifyToken }) => {
  const user = new User({ email, password, verifyToken })
  return await user.save()
}
const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token })
}

const updateAvatar = async (id, avatar,imgIdCloud) => {
  return await User.updateOne({ _id: id }, { avatar,imgIdCloud })
}

const findByToken = async (token) => {
  return await User.findOne({ token });
};

const findByVerifyToken = async (verifyToken) => {
  return await User.findOne({ verifyToken })
}

const updateVerifyToken = async (id, verify, verifyToken) => {
  return await User.findOneAndUpdate({ _id: id }, { verify, verifyToken }) 
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateToken,
  findByToken,
  updateAvatar,
  findByVerifyToken,
  updateVerifyToken,
}