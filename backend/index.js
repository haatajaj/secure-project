import express from "express";
import https from "https";
import fs from "fs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import cors from "cors";
import bodyParser from "body-parser";

import {PORT} from "./config.js";
import connectDb from "./database/connectDb.js";
import User from "./database/userModel.js";

connectDb();

const options = {
    key: fs.readFileSync(".secret/selfsigned.key"),
    cert: fs.readFileSync(".secret/selfsigned.crt")
};

const app = express()
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Home")
});

app.post("/register", async (req, res) => {
    const username = "testuser2"
    const password = "Salasana123"
    const email = "test2@email.com"
    const firstname = "First"
    const lastname = "Last"
    const birthdate = "1997-01-01"

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
        return res.status(200).send({
            message: "Password matches"
        })
        

        // Create jwt token and send to client

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

const server = https.createServer(options, app)
server.listen(PORT, () => {
    console.log("Connected: HTTPS on port " + PORT)
});

app.listen(3002, () => {
    console.log("Connected: HTTP on port " + 3002)
});