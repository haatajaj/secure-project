import express from "express";
import https from "https";
import fs from "fs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";
import hpp from "hpp";
import {randomBytes, createHash} from "node:crypto";
import { rateLimit } from "express-rate-limit"
import {body, validationResult } from "express-validator"


import connectDb from "./database/connectDb.js";
import User from "./database/userModel.js";
import { strict } from "assert";
import { log } from "console";
import { subscribe } from "diagnostics_channel";



const options = {
    key: fs.readFileSync("../.secret/localhost-key.pem"),
    cert: fs.readFileSync("../.secret/localhost.pem")
};

const app = express()
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


app.get("/", (req, res) => {
  res.send("Home")
});

app.get("/auth", async (req, res) => {
    try{
        let jwt_token = req.headers.authorization;
        if(!jwt_token) {
            throw new Error("No JWT")
        }
        const randomStr = req.headers.cookie.split("=")[1];
        if(!randomStr) {
            throw new Error("No RandomString")
        }
        const verifiedToken = jwt.verify(jwt_token, process.env.JWT_TOKEN);

        const hash = createHash("SHA256").update(randomStr).digest("base64");
        if(verifiedToken.sub !== hash) {
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

app.post("/register", body().isJSON().escape(), async (req, res) => {
    // Passing values from JSON to explicit values that get stored
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const birthdate = new Date(req.body.birthdate);

    try{
        const valRes = validationResult(req);
        if(!valRes.isEmpty()) {
            throw new Error("Validation Error")
        }
        // Using argon2id hashing function per OWASP recommendation
        const hash = await argon2.hash(password, {
            // Default values, over the OWASP minimun config
            type: argon2.argon2id,
            memoryCost: 65536,
            parallelism: 4,
            timeCost: 3,
            secret: Buffer.from(process.env.PEPPER),
        });

        try {
            const user = new User({
                username: username,
                password: hash,
                email: email,
                firstname: firstname,
                lastname: lastname,
                birthdate: birthdate
            });
            // Save user
            const result = await user.save();

            const [jwt_token, randomStr] = createJWT(user.username);

            // Add fingerprint to a 'hardened' cookie in the response 
            // (Will hash this and check against the hash in the jwt)
            res.cookie('__Secure-fingerprint', randomStr, {
                httpOnly:true, 
                sameSite:"strict", 
                secure:true, 
                maxAge: new Date(Date.now() + 30000)});
    
            return res.status(201).send({
                message: "Registration succesful",
                jwt_token
            });
        } catch (err) {
            if(err.name == "MongoServerError") {
                if(err.code === 11000) {
                    const val = Object.keys(err.keyValue)[0]
                    return res.status(400).send({
                        message: "Already in use",
                        duplicate: val,
                    });
            }} else if(err.name == "ValidationError") {
                const val = err.message.split(":").at(-1);
                return res.status(400).send({
                    message: "Error during validation",
                    duplicate: val,
                });
            }
            return res.status(400).send({
                message: "Error during registration"
            });
        }
    } catch (err) {
        res.status(400).send({
            message: "User not registered"
        });
    }

});

app.post("/login", body().isJSON().escape(), async (req, res) => {
    // Passing values from JSON to explicit values that get stored
    const username = req.body.username;
    const password = req.body.password;

    try {
        const valRes = validationResult(req);
        if(!valRes.isEmpty()) {
            throw new Error("Validation Error")
        }

        const user = await User.findOne({username:username}).exec();
        if(user === null) {
            console.log("Not found");
            return res.status(401).send({
                message: "Invalid credentials"
            })
        }
        if(!await argon2.verify(user.password, password, {secret: Buffer.from(process.env.PEPPER)})) {
            console.log("Invalid");
            return res.status(401).send({
                message: "Invalid credentials"
            })
        }

        const [jwt_token, randomStr] = createJWT(user.username);

        // Add fingerprint to a 'hardened' cookie in the response 
        // (Will hash this and check against the hash in the jwt)
        res.cookie('__Secure-fingerprint', randomStr, {
            httpOnly:true, 
            sameSite:"strict", 
            secure:true, 
            maxAge: new Date(Date.now() + 30000)});

        return res.status(200).send({
            message: "Authentication succesful",
            jwt_token
        });
    } catch (err) {
        return res.status(401).send({
            message: "Invalid credentials"
        })
    };
});

server.listen(process.env.HTTPS_PORT, () => {
    console.log("Connected: HTTPS on port " + process.env.HTTPS_PORT)
});
