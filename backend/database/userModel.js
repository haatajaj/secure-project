import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, "Provide an username"], 
        unique: [true, "Username already in use"],
        minLength: [6, "Username must be atleaset 6 letters"], 
        maxLength: [12, "Username must be at most 12 letters"],
        validate: {
            validator: function(val) {
                return !/^[0-9A-Za-z]$/.test(val);
            },
            message: "Invalid username"
        }
    },
    password: {        
        type: String, 
        required: [true, "Provide a password"],
        unique: false
    },
    email: {
        type: String, 
        required: [true, "Provide an email"],
        unique: [true, "Email already in use"],
        validate: {
            validator: function(val) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            },
            message: "Invalid email format"
        }
    },
    firstname: {
        type: String,
        required: [true, "Provide a firstname"],
        unique: false
    },
    lastname: {
        type: String,
        required: [true, "Provide a lastname"],
        unique: false
    },
    birthdate: {
        type: Date,
        required: [true, "Provide a birthdate"],
        unique: false,
        min: ["1924-01-01", "Be less than 100 years old"],
        max: ["2006-01-01", "Be more than 18 years old"]
    }
});
export default mongoose.model.Users || mongoose.model("Users", UserSchema);