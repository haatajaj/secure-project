import express from "express";
import https from "https";
import fs from "fs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";
import hpp from "hpp";
import {randomBytes, createHash} from "node:crypto";
import { rateLimit } from 'express-rate-limit'


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
            "secret",
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
        console.log(jwt_token);
        const randomStr = req.headers.cookie.split("=")[1];
        console.log("RAND: " + randomStr);
        const verifiedToken = await jwt.verify(jwt_token, "secret");
        console.log(verifiedToken);

        const hash = createHash("SHA256").update(randomStr).digest("base64");
        if(verifiedToken.sub !== hash) {
            throw new Error("Context doesn't match")
        }
        
        //console.log(verifiedToken);
        const user = await User.findOne({username:verifiedToken.username}).exec();
        //console.log(user);
        const sanitizedUser = (() => {
            return {
                "username": user.username,
                "firstname": user.firstname,
                "lastname": user.lastname,
                "email": user.email
            }
        })();

        res.status(200).send({
            message: "Authorization succesful",
            sanitizedUser
        });

    } catch (err) {
        console.log(err);
        res.status(401).send({
            message: err.message
        });
    }
});

app.post("/register", async (req, res) => {
    console.log(req.body);
    const size = Buffer.byteLength(JSON.stringify(req.body))
    console.log(size)
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const birthdate = new Date(req.body.birthdate);

    //Validate user inputs

    try{
        const hash = await argon2.hash(password, {
            // Defaults, over the OWASP minimun config
            type: argon2.argon2id,
            memoryCost: 65536,
            parallelism: 4,
            timeCost: 3
            // secret: 
        });
        console.log(hash)
        const user = new User({
            username: username,
            password: hash,
            email: email,
            firstname: firstname,
            lastname: lastname,
            birthdate: birthdate
        });
        
        // Save user
        try {
            const result = await user.save();

            const jwt_token = jwt.sign({
                username: user.username}, 
                "secret",
                {expiresIn: "30s",
                 //subject: hash
                });

            //console.log(result);
            res.status(201).send({
                message: "User registered",
                jwt_token
            });
        } catch (err) {
            console.log(err);
            res.status(400).send({
                message: "User not registered"
            });
        }

    } catch (err) {
        console.log("Failure in hashing the password")
        console.log(err);
        res.status(400).send({
            message: "User not registered"
        });
    }

});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    //console.log("Cookie: " + req.header.cookie);
    try {
        const user = await User.findOne({username:username}).exec();
        if(user === null) {
            console.log("Not found");
            return res.status(401).send({
                message: "User not found or credentials invalid"
            })
        }
        if(!await argon2.verify(user.password, password)) {
            return res.status(401).send({
                message: "User not found or credentials invalid"
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
            jwt_token,
            randomStr,
        });

    } catch (err) {
        return res.status(400).send({
            message: "Error occurred"
        })
    };
});

server.listen(process.env.HTTPS_PORT, () => {
    console.log("Connected: HTTPS on port " + process.env.HTTPS_PORT)
});
