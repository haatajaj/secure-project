import express from "express";
import https from "https";
import fs from "fs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";
import hpp from "hpp";
import {randomBytes, createHash} from "node:crypto";

import {PORT} from "./config.js";
import connectDb from "./database/connectDb.js";
import User from "./database/userModel.js";
import { strict } from "assert";

connectDb();

const options = {
    key: fs.readFileSync("../.secret/localhost-key.pem"),
    cert: fs.readFileSync("../.secret/localhost.pem")
};

const app = express()
app.use(cors({
    origin: ["https://localhost:3000"],
    credentials: true,
    //sameSite: "none"
}));
app.use(bodyParser.json());
app.use(hpp());

const server = https.createServer(options, app)

app.get("/", (req, res) => {
  res.send("Home")
});

app.get("/auth", async (req, res) => {
    try{
        const jwt_token = req.headers.authorization.split(" ")[1];
        const verifiedToken = await jwt.verify(jwt_token, "secret");
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
        res.status(500).send({
            message: "Error during authorization",
            err
        });
    }
});

app.post("/register", async (req, res) => {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const birthdate = new Date(req.body.birthdate);

    //const username = "testuser2"
    //const password = "Salasana123"
    //const email = "test2@email.com"
    //const firstname = "First"
    //const lastname = "Last"
    //const birthdate = "1997-01-01"

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
            //console.log(result);
            res.status(201).send({
                message: "User registered",
                result
            });
        } catch (err) {
            console.log(err);
            res.status(500).send({
                message: "Error during registration",
                err
            });
        }

        /*
        await user.save(function(res, err){
            if(err) {
                console.log(err);
            } else {
                console.log(res);
            }
        });
        */
        


    } catch (err) {
        console.log("Failure in hashing the password")
        console.log(err);
        res.status(500).send({
            message: "Error during hashing",
            err
        });
    }

});

app.post("/login", async (req, res) => {
    console.log(req.body);
    const username = req.body.username;
    const password = req.body.password;
    console.log("Cookie: " + req.header.cookie);
    try {
        const user = await User.findOne({username:username}).exec();
        if(user === null) {
            console.log("Not found");
            return res.status(404).send({
                message: "Username not found"
            })
        }
        /*
        return res.status(200).send({
            message: "Username found"
        })
        */
        if(!await argon2.verify(user.password, password)) {
            console.log("No Match");
            return res.status(400).send({
                message: "Password not correct"
            })
        }
        console.log("Match");

        // Create fingerprint for adding context to the jwt
        const randomStr = randomBytes(64).toString("hex");
        console.log(randomStr)

        const hash = createHash("SHA256").update(randomStr).digest("base64");
        
        console.log(hash)

        // Add fingerprint to a 'hardened' cookie in the response 
        // (Will hash this and check against the hash in the jwt)
        res.cookie('__Secure-fingerprint', randomStr, {
            httpOnly:true, 
            sameSite:"strict", 
            secure:true, 
            maxAge: new Date(Date.now() + 30000)});

        console.log(res.cookie)


        // Create jwt token and send to client
        const jwt_token = jwt.sign({
            username: user.username}, 
            "secret",
            {expiresIn: "20s",
             //subject: hash
            });


        return res.status(200).send({
            message: "Logged in",
            username: user.username,
            jwt_token
        })

    } catch (err) {
        console.log(err);
        return res.status(400).send({
            message: "Error",
            err
        })
    };



/*
    User.findOne({username:username}) 
    .then((user) => {
        argon2.verify(user.password, password, {
            // Defaults, over the OWASP minimun config
            type: argon2.argon2id,
            memoryCost: 65536,
            parallelism: 4,
            timeCost: 3
            // secret: 
        })
        .then((argon2Match) => {
            if(!argon2Match) {
                console.log("Password doesn't match");
                res.status(400).send({
                    message: "Password doesn't match",
                    argon2Match
                });
            } 






        })
        .catch((err) => {
            console.log(err);
            res.status(400).send({
                message: "Error during password matching",
                err
            });
        });
    })
    .catch((err) => {
        res.status(404).send({
            message: "Username not found",
            err
        });

    })


    //const result = await User.find({});
    //console.log(result);
    //res.status(201).send({
    //    message: "Login",
    //    result
    //});*/
});

server.listen(process.env.HTTPS_PORT, () => {
    console.log("Connected: HTTPS on port " + process.env.HTTPS_PORT)
});

/*app.listen(3002, () => {
    console.log("Connected: HTTP on port " + 3002)
});*/