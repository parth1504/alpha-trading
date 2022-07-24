const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');



const UserSchema = new Schema({
    email: {
        type:String,
        required:true,
        unique:true
    },
    Wallet:{
        type:Number,
        default:50000
    },
    stock: [{
        title:String,
        price:Number,
        quantity:Number
    }],
    
});

UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User', UserSchema);
