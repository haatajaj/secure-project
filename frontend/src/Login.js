import { useState } from "react";
import React from "react";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import './Register.css';

const cookies = new Cookies(null, { path: '/' });

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [usernameErr, setUsernameErr] = useState("")
    const [passwordErr, setPasswordErr] = useState("")

    const navigate = useNavigate();

    const onButtonClick = () => {
        setUsernameErr("")
        setPasswordErr("")
        let check = 0;

        if(username === "") {
            setUsernameErr("Enter your username, 4-12 letters")
            check = 1;
        }
        else if(!/^[0-9A-Za-z]{4,12}$/.test(username)) {
            setUsernameErr("Enter valid username, 4-12 letters")
            check = 1;
        }
        if(password === "") {
            setPasswordErr("Enter password, must contain 10-40 letters, capitalized, uncapitalized and a number")
            check = 1;
        }
        else if(!/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{10,40}$/.test(password)) {
            setPasswordErr("Invalid, must contain 10-40 letters, capitalized, uncapitalized and a number")
            check = 1;
        }

        if(check === 1) {
            console.log("Invalid form")
        } else {

            fetch("https://localhost:3001/login", {
                method: "POST",
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            })
            .then((res) => res.json())
            .then((data) => {
                cookies.set("JWT_TOKEN", data.jwt_token)
                //console.log(data.jwt_token);
                console.log("Documents: " + document.cookie);
                //console.log("Universal: " + cookies.get("TOKEN"));
                navigate("/");
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }

    return (
        <div className="main">
            <NavBar />
            <div className="title">
                <h1>Login</h1>
            </div>
            <div className="inputDiv">
                <input
                    value={username}
                    placeholder="username"
                    onChange={(x) => setUsername(x.target.value)}
                />
                <br/>
                <label className="errorLabel">{usernameErr}</label>
            </div>
            <div className="inputDiv">
                <input 
                    value={password}
                    type="password"
                    placeholder="password"
                    onChange={(x) => setPassword(x.target.value)}
                />
                    <br/>
                    <label className="errorLabel">{passwordErr}</label>
            </div>
            <div className="inputDiv">
                <input className="inputButton" type="button" onClick={onButtonClick} value={"Login"} />
            </div>
        </div>
    );
}
export default Login;