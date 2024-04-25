import express from "express";
import https from "https";
import fs from "fs";

import {PORT} from "./config.js";
import connectDb from "./database/connectDb.js";

connectDb();

const options = {
    key: fs.readFileSync('.secret/selfsigned.key'),
    cert: fs.readFileSync('.secret/selfsigned.crt')
};

const app = express()
app.get('/', (req, res) => {
  res.send('Login')
});

const server = https.createServer(options, app)
server.listen(PORT, () => {
    console.log('HTTPS Server started on port ' + PORT)
});

app.listen(3002, () => {
    console.log('HTTP Server started on port ' + 3001)
});