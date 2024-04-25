import mongoose, { mongo } from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {},
    password: {},
    email: {},
    firstname: {},
    lastname: {},
    birthdate: {},
    id: {}



});
export default mongoose.model.Users || mongoose.model("Users", UserSchema);