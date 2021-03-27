const Contacts = require('../model/contacts')
const {HttpCode}=require('../helpers/constants')

const getAllContats= async (req, res, next) => {
  try {
    const userId=req.user.id
    const contacts = await Contacts.listContacts(userId,req.query)
    return res.json({
      status: 'success',
      code: 200,
      data: {
        ...contacts,
      },
    })
  } catch (e) {
    next(e)
  }
}

const getContactByID = async (req, res, next) => {
  try {
    const userId=req.user.id
    const contact = await Contacts.getContactById(req.params.contactId,userId);
    if (contact) {
      return res.json({
        status: "success",
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: "Not Found",
      });
    }
  } catch (e) {
    next(e);
  }
}

const createContact= async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contact = await Contacts.addContact({ ...req.body, owner: userId });
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        contact,
      },
    });
  } catch (e) {
    if (e.name === 'ValidationError' || e.name === 'MongoError') {
      return next({
        status: HttpCode.BAD_REQUEST,
        message: e.message.replace(/"/g, ''),
      });
    }
    next(e);
  }
};


const removeContact= async (req, res, next) => {
  try {
   const userId=req.user.id
   const contact = await Contacts.removeContact(req.params.id,userId);
   if (contact) {
      return res.json({
        status: "success",
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: "Not Found",
      });
    }
  } catch (e) {
    next(e);
  }
}

const updateContact= async (req, res, next) => {
  try {
const userId=req.user.id
   if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "missing fields",
        code: 400,
      });
   }
    
    const contact = await Contacts.updateContact(req.params.contactId, req.body,userId);
    
   if (contact) {
      return res.json({
        status: "success",
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      return res.status(404).json({
        status: "error",
        code: 404,
        data: "Not Found",
      });
    }
  } catch (e) {
    next(e);
  }
}

module.exports = {
    getAllContats,
    getContactByID,
    createContact,
    removeContact,
    updateContact
}
