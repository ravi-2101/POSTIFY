const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true 
    },
    userName : {
        type : String,
        required : true,
        unique : true ,
        validate: {
            validator: function (value) {
              return /^[a-zA-Z0-9_@]+$/.test(value);
            },
            message: 'Username can only contain letters, numbers, underscore (_), and @',
          },
    },
    password : {
        type : String,
        required : true
    },
    confirmPassword : {
        type: String
    } ,
    email : {
        type : String,
        trim : true,
        lowercase : true,
        validate: {
            validator: function (value) {
              return !value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net)$/.test(value);
            },
            message: 'Email must be a valid format and end with .com or .net',
          },
    },
    phone : {
        type : String,
        trim : true
    },
    profile : {
        type : String,
        valid : ['image/jpeg', 'image/png'],
        required : true
    },
    DOB : {
        type : Date,
        required : true,
        default : Date.now()
    },
    token : {
        type : String ,
        default : null 
    },
    tokenExpiresAt : {
        type : Date,
        default : Date.now()
    }
},{timestamps: true, versionKey : false});


userSchema.pre('save', function (next) {
    if (!this.email && !this.phone) {
      return next(new Error('Either email or phone number is required.'));
    }
    next();
  });

const User = mongoose.model("User",userSchema);

module.exports = User;