import express from "express";
import https from "https";
import fs from "fs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cors from "cors";
import hpp from "hpp";
import {randomBytes, createHash} from "node:crypto";
import { rateLimit } from "express-rate-limit"
import {body, check, validationResult } from "express-validator"

import createJWT from "./jwt.js";
import connectDb from "./database/connectDb.js";
import User from "./database/userModel.js";

const options = {
    key: fs.readFileSync("../.secret/localhost-key.pem"),
    cert: fs.readFileSync("../.secret/localhost.pem")
};

const app = express();

app.use(cors({
    origin: ["https://localhost:3000"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(rateLimit({
    windowMs: 15*60*1000, // 15 mins
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
}));

app.use(express.json({limit: "500b"}));
app.use(hpp());

connectDb();

const server = https.createServer(options, app)

app.get("/auth", [
    check("jwt_token").notEmpty().isString().escape(),
    check("__Secure-fingerprint").notEmpty().isString().escape(),
], async (req, res) => {
    try{
        const valRes = validationResult(req);
        if(!valRes.isEmpty()) {
            console.log(valRes);
            throw new Error("Validation Error")
        }

        let jwt_token = req.headers.authorization;
        if(!jwt_token) {
            throw new Error("No JWT")
        }
        console.log(jwt_token);
        const randomStr = req.headers.cookie.split("=")[1];
        if(!randomStr) {
            throw new Error("No RandomString")
        }
        console.log(randomStr);
        const verifiedToken = jwt.verify(jwt_token, process.env.JWT_TOKEN);

        const hash = createHash("SHA256").update(randomStr).digest("base64");
        if(verifiedToken.sub !== hash) {
            console.log("Ei täsmää");
            throw new Error("Invalid Credentials")
        }
        
        const user = await User.findOne({username:verifiedToken.username}).exec();

        const sanitizedUser = (() => {
            return {
                "username": user.username,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email
            }
        })();

        res.status(200).send({
            message: "Authorization successful",
            sanitizedUser
        });
    } catch (err) {
        res.status(401).send({
            message: "Invalid credentials"
        });
    }
});

// Register should recieve provided user data that is stored in the database. The request body should contain 
// : username, password, email, firstname, lastname, birthdate
// Express validator is used to verify that the body contains the values and they are then sanitized
app.post("/register", [
    body("username").notEmpty().isString().escape(), 
    body("password").notEmpty().isString().escape(),
    body("email").notEmpty().isString().escape(),
    body("firstname").notEmpty().isString().escape(),
    body("lastname").notEmpty().isString().escape(),
    body("birthdate").notEmpty().isString().isDate().escape(),], async (req, res) => {
    try{
        const valRes = validationResult(req);
        if(!valRes.isEmpty()) {
            console.log(valRes);
            throw new Error("Invalid user data")
        }

        // Passing values from JSON to explicit values that get stored
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const birthdate = new Date(req.body.birthdate);
        
        // Using argon2id hashing function per OWASP recommendation with pepper
        const hash = await argon2.hash(password, {
            // Default values, over the OWASP minimun config
            type: argon2.argon2id,
            memoryCost: 65536,
            parallelism: 4,
            timeCost: 3,
            secret: Buffer.from(process.env.PEPPER),
        });

        // User input is collected to a new user and then saved to the database.
        // MongoServerError is thrown if the new user contains duplicates to unique values
        // ValidationError is thrown if the values don't match the User schema.
        try {
            const user = new User({
                username: username,
                password: hash,
                email: email,
                firstname: firstname,
                lastname: lastname,
                birthdate: birthdate
            });
            const result = await user.save();

            // JWT is generated with additional context (fingerprint)
            const [jwt_token, randomStr] = createJWT(user.username);

            // Fingerprint is added to a 'hardened' cookie in the response
            // Both have 30 seconds of time till expiration
            res.cookie('__Secure-fingerprint', randomStr, {
                httpOnly:true, 
                sameSite:"strict", 
                secure:true, 
                maxAge: new Date(Date.now() + 30000)});
    
            // Successful response contains the JWT in its body and the hardened cookie in its header
            return res.status(201).send({
                message: "Registration succesful",
                jwt_token
            });
        } catch (err) {
            if(err.name == "MongoServerError") {
                if(err.code === 11000) {
                    const val = Object.keys(err.keyValue)[0]
                    return res.status(401).send({
                        message: "Already in use",
                        duplicate: val,
                    });
            }} else if(err.name == "ValidationError") {
                const val = err.message.split(":").at(-1);
                return res.status(401).send({
                    message: "Error during validation",
                    duplicate: val,
                });
            }
            return res.status(400).send({
                message: "Error during registration"
            });
        }
    } catch (err) {
        res.status(401).send({
            message: "User not registered"
        });
    }

});

// Login should recieve a request with a body that contains users username and password. 
// If successful  -> responds with 200 code and a jwt-token and context
// If invalid     -> responds with 401 
// If other error -> responds with 400 
// The values of the body are first validated and sanitized with express-validator
app.post("/login", [
    body("username").notEmpty().isString().escape(), 
    body("password").notEmpty().isString().escape()], async (req, res) => {
    try {
        const valRes = validationResult(req);
        if(!valRes.isEmpty()) {
            console.log(valRes);
            throw new Error("Invalid credentials")
        }
        // Passing values from JSON to explicit values that are used in query and cheks
        const username = req.body.username;
        const password = req.body.password;

        const user = await User.findOne({username:username}).exec();
        if(user === null) {
            throw new Error("Invalid credentials")
        }

        // Argon2id with a pepper is used to verify the password with the stored hash
        if(!await argon2.verify(user.password, password, {secret: Buffer.from(process.env.PEPPER)})) {
            throw new Error("Invalid credentials")
        }

        // JWT is generated with additional context (fingerprint)
        const [jwt_token, randomStr] = createJWT(user.username);

        // Fingerprint is added to a 'hardened' cookie in the response 
        // Both have 30 seconds of time till expiration
        res.cookie('__Secure-fingerprint', randomStr, {
            httpOnly:true, 
            sameSite:"strict", 
            secure:true, 
            maxAge: new Date(Date.now() + 30000)}
        );
        
        // Successful response contains the JWT in its body and the hardened cookie in its header
        return res.status(200).send({
            message: "Authentication successful",
            jwt_token
        });
    } catch (err) {
        // Thrown errors are caught and depending on the message, response is sent
        if(err.message === "Invalid credentials") {
            return res.status(401).send({
                message: "Invalid credentials"
            });
        } else {
            return res.status(400).send({
                message: "Authentication not successful"
            });
        }
    };
});

server.listen(process.env.HTTPS_PORT, () => {
    console.log("Connected: HTTPS on port " + process.env.HTTPS_PORT)
});
