const mongoose = require('mongoose')
const config = require('config')
const db = config.get('MONGOURI')

const connectDB = async () => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useCreateIndex: true
        });
        console.log('Connected To database')
    } catch(err){
        console.log(err.message);
        
        //Exits process with failure
        process.exit(1)
    }
}

module.exports = connectDB