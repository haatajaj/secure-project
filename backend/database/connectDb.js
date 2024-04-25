import mongoose from "mongoose";

//const connectDb = async () => {
async function connectDb() {
    console.log(process.env.DB_URL);
    mongoose.connect(process.env.DB_URL)
    .then(() => {console.log("Connected to MongoDB Atlas");})
    .catch((err) => {console.log(err);});


};
export default connectDb;