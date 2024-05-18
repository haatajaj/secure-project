import {expect} from "chai";

import jwt from "jsonwebtoken";
import {createHash} from "node:crypto";

import createJWT from "../jwt.js";

describe("Testing createJWT-module", () => {
    it("Should return an array", () => {
        let username = "testi";
        let res = createJWT(username);
        expect(res).to.be.an("array");
    });

    it("Successful verification should return an object", () => {
        let username = "testi";
        let res = createJWT(username);
        let [jwt_token, randomStr] = res;
        expect(jwt.verify(jwt_token, process.env.JWT_SECRET)).to.be.an("object");
    });

    it("Unsuccessful verification should throw an error", () => {
        let username = "testi";
        let res = createJWT(username);
        let [jwt_token, randomStr] = res;
        expect(() => jwt.verify(jwt_token, "wrong secret")).to.throw("invalid signature");
    });

    it("Verified jwt should contain hashed context", () => {
        let username = "testi";
        let res = createJWT(username);
        let [jwt_token, randomStr] = res;
        let verifiedToken = jwt.verify(jwt_token, process.env.JWT_SECRET);
        expect(verifiedToken.sub).to.exist;
    });

    it("Hash of verified jwt should equal hash of randomSrt", () => {
        let username = "testi";
        let res = createJWT(username);
        let [jwt_token, randomStr] = res;
        let verifiedToken = jwt.verify(jwt_token, process.env.JWT_SECRET);
        expect(verifiedToken.sub).to.equal(createHash("SHA256").update(randomStr).digest("base64"));
    });

    it("Verified token should expire in 30 seconds", () => {
        let username = "testi";
        let res = createJWT(username);
        let [jwt_token, randomStr] = res;
        let verifiedToken = jwt.verify(jwt_token, process.env.JWT_SECRET);
        expect(verifiedToken.iat).to.equal(verifiedToken.exp-30);
    });
});