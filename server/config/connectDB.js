const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECTION)
        console.log(`MongoDB Connected: ${connect.connection.host}`.cyan.underline);
}   
    catch (error) {
            console.log(error);
            process.exit(1)
    }

}


module.exports = connectDB