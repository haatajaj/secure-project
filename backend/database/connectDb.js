import mongoose from "mongoose";

async function connectDb() {
    mongoose.connect(process.env.DB_URL)
    .then(() => {console.log("Connected: MongoDB Atlas");})
    .catch((err) => {console.log(err);});


};
export default connectDb;