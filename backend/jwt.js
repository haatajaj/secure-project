import jwt from "jsonwebtoken";
import {randomBytes, createHash} from "node:crypto";

function createJWT(username) {
    // Create fingerprint for adding context to the jwt
    const randomStr = randomBytes(64).toString("hex");
    const hash = createHash("SHA256").update(randomStr).digest("base64");

    // Create jwt token and send to client
    const jwt_token = jwt.sign({
        username: username}, 
        process.env.JWT_SECRET,
        {expiresIn: "30s",
         subject: hash
        }
    );
    return [jwt_token, randomStr]
};  
export default createJWT;