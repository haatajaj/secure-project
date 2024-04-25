import { useState } from "react";
import React from "react";
import NavBar from "./NavBar";


const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const [usernameErr, setUsernameErr] = useState("")
    const [passwordErr, setPasswordErr] = useState("")




    const onButtonClick = () => {
        setUsernameErr("")
        setPasswordErr("")

        if(username === "") {
            setUsernameErr("Enter your username")
        }
        else if(!/^[0-9A-Za-z]{4,12}$/.test(username)) {
            setUsernameErr("Enter valid username")
        }
        if(password === "") {
            setPasswordErr("Enter your password")
        }
        else if(!/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{10,40}$/.test(password)) {
            setPasswordErr("Enter valid password")
        }

    }

    return (
        <div className="main">
            <NavBar />
            <div className="title">
                <h1>Login</h1>
            </div>
            <div className="inputDiv1">
                <input
                    value={username}
                    placeholder="username"
                    onChange={(x) => setUsername(x.target.value)}
                />
                <br/>
                <label>{usernameErr}</label>
            </div>
            <div className="inputDiv2">
                <input 
                    value={password}
                    type="password"
                    placeholder="password"
                    onChange={(x) => setPassword(x.target.value)}
                />
                    <br/>
                    <label>{passwordErr}</label>
            </div>
            <div className="inputDiv3">
                <input className="inputButton" type="button" onClick={onButtonClick} value={"Login"} />
            </div>
        </div>
    );
}
export default Login;