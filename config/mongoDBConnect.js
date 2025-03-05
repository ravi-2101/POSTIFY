const mongoose = require('mongoose');

const mongoDBConnect = async () => {
    try {
       await  mongoose.connect(process.env.DATABASE_URL)
       .then(() => console.log("database connected successfully!"))
        .catch((err) => console.log(err))
    } catch (error) {
        console.log("database connection error : ",error);
    }
}

module.exports = mongoDBConnect;