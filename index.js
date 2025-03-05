const express = require ('express');
const app = express();
const mongoDBConnect = require('./config/mongoDBConnect')
require('dotenv').config()
const router = require('./routes/index')


const port = process.env.PORT;

app.use(express.json());
app.use('/api',router);


app.listen(port,()=> {
    console.log("server connected successfully : ",port);
})
mongoDBConnect()


