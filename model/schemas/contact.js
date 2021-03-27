const mongoose = require('mongoose');
const { Subscription } = require('../../helpers/constants');
const { Schema, model, SchemaTypes } = mongoose
const mongoosePaginate = require('mongoose-paginate-v2');
 
const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
        unique:true,
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: true,
      validate(value) {
        const re = /\S+@\S+\.\S+/
        return re.test(String(value).toLowerCase())
      },
    },
    phone: {
        type: String,
        required: [true, 'Set phone for contact'],
        unique: true,
        validate: {
        validator: v => /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/.test(v),
        message: props => `${props.value} is not a valid phone number!`,
      },
    },
    subscription: {
        type: String,
        default: Subscription.FREE,
        enum: {
            values: [Subscription.FREE, Subscription.PREMIUM, Subscription.PRO],
             message:"Not allowed subscription",
        },
       
    },
    owner: {
        type: SchemaTypes.ObjectId,
        ref: 'user',
    },

},
    {
        versionKey: false,
        timestamps:true
    }
);
 
contactSchema.plugin(mongoosePaginate);
const Contact = model('contact', contactSchema)
module.exports=Contact