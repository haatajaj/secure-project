import { useState } from "react";
import DatePicker from "react-datepicker";
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import PasswordStrength from "./PasswordStrength";
import Popup from 'reactjs-popup';

import './Register.css';
import "react-datepicker/dist/react-datepicker.css";

const Register = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [conPassword, setConPassword] = useState("")
    const [email, setEmail] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [birthdate, setBirthdate] = useState(new Date())

    const [usernameErr, setUsernameErr] = useState("")
    const [passwordErr, setPasswordErr] = useState("")
    const [conPasswordErr, setConPasswordErr] = useState("")
    const [emailErr, setEmailErr] = useState("")
    const [firstnameErr, setFirstnameErr] = useState("")
    const [lastnameErr, setLastnameErr] = useState("")
    const [birthdateErr, setBirthdateErr] = useState("")

    const [requestdErr, setrequestdErr] = useState("")

    const contentStyle = { 'background': 'lightgray', 'fontSize': '12px', 'maxWidth': '150px' };
    const arrowStyle = { color: 'lightgray' };



    const navigate = useNavigate();



    const onButtonClick = () => {
        setUsernameErr("")
        setPasswordErr("")
        setConPasswordErr("")
        setEmailErr("")
        setFirstnameErr("")
        setLastnameErr("")
        setBirthdateErr("")

        let check = 0;

        if (username === "") {
            setUsernameErr("Enter username")
            check = 1;
        }
        else if (!/^[0-9A-Za-z]{6,12}$/.test(username)) {
            setUsernameErr("Must be over 6 letters")
            check = 1;
        }

        if (password === "") {
            setPasswordErr("Enter password")
            check = 1;
        }
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\]^_`{|}~])(?=.{10,})/.test(password)) {
            setPasswordErr("Invalid")
            check = 1;
        }

        if (conPassword === "") {
            setConPasswordErr("Enter password")
            check = 1;
        }
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*"'()+,-./:;<=>?[\]^_`{|}~])(?=.{10,})/.test(conPassword)) {
            setConPasswordErr("Invalid")
            check = 1;
        }
        else if (password !== conPassword) {
            setConPasswordErr("Passwords must be same")
            check = 1;
        }

        if (email === "") {
            setEmailErr("Enter your email")
            check = 1;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr("Enter valid email")
            check = 1;
        }

        if (firstname === "") {
            setFirstnameErr("Enter first name")
            check = 1;
        }

        if (lastname === "") {
            setLastnameErr("Enter last name")
            check = 1;
        }

        if (!birthdate) {
            setBirthdateErr("Set birthdate")
            check = 1;
        }

        var age = (() => {
            var now = new Date();
            var ageYears = now.getFullYear() - birthdate.getFullYear();
            var ageMonths = now.getMonth - birthdate.getMonth();
            if (ageMonths < 0 || (ageMonths === 0 && now.getDate() < birthdate.getDate())) {
                ageYears--;
            }
            return ageYears;
        })();
        if (age < 18) {
            setBirthdateErr("Must be over 18")
        }

        if (check === 0) {
            fetch("https://localhost:3001/register", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password, email, firstname, lastname, birthdate })
            })
                .then((res) => {
                    if(res.status === 201) {
                        return res.json();
                    } else if(res.status === 400) {
                        return res.json();
                    } else if(res.status === 429) {
                        throw new Error("Rate limit reached. Try again in 15 min")
                    } else {
                        throw new Error("Error occurred during registration") //Default
                    }
                    
                    })
                .then((data) => {
                    if(data.val === "username") {
                        setrequestdErr("Username already in use")
                    } else if(data.val === "email") {
                        setrequestdErr("Email already in use")
                    } else {
                        sessionStorage.setItem("JWT_token", data.jwt_token)
                        navigate("/");
                    }

                })
                .catch((err) => {
                    setrequestdErr(err.message);
                })
        }

    }

    return (
        <div className="main">
            <NavBar />
            <div className="title">
                <h1>Register</h1>
            </div>
            <div className="registerContainer">
                <div className="inputDiv">
                    <input
                        value={username}
                        maxLength={12}
                        placeholder="username"
                        onChange={(x) => setUsername(x.target.value)}
                    />
                    <br />
                    <label className="errorLabel">{usernameErr}</label>
                </div>
                <div className="inputDiv">
                    <Popup
                        trigger={open => (
                            <input
                                value={password}
                                maxLength={36}
                                onFocus={() => open === true}

                                type="password"
                                placeholder="password"
                                onChange={(x) => setPassword(x.target.value)}
                            />)}
                        position={"right top"}
                        {...{ contentStyle, arrowStyle }}
                    >
                        Must contain uppercase, lowercase letters and number, and over 10 letters.

                    </Popup>
                    <br />
                    <PasswordStrength password={password} />
                    <label className="errorLabel">{passwordErr}</label>
                </div>
                <div className="inputDiv">
                    <Popup
                        trigger={open => (
                            <input
                                value={conPassword}
                                maxLength={36}
                                onFocus={() => open === true}

                                type="password"
                                placeholder="pasword"
                                onChange={(x) => setConPassword(x.target.value)}
                            />
                        )}
                        position={"right top"}
                        {...{ contentStyle, arrowStyle }}
                    >
                        Must contain uppercase, lowercase letters and number, and over 10 letters.
                    </Popup>

                    <br />
                    <PasswordStrength password={conPassword} />
                    <label className="errorLabel">{conPasswordErr}</label>
                </div>
                <div className="inputDiv">
                    <input
                        value={email}
                        placeholder="email"
                        onChange={(x) => setEmail(x.target.value)}
                    />
                    <br />
                    <label className="errorLabel">{emailErr}</label>
                </div>
                <div className="inputDiv">
                    <input
                        value={firstname}
                        maxLength={30}
                        placeholder="firstname"
                        onChange={(x) => setFirstname(x.target.value)}
                    />
                    <br />
                    <label className="errorLabel">{firstnameErr}</label>
                </div>
                <div className="inputDiv">
                    <input
                        value={lastname}
                        maxLength={30}
                        placeholder="lastname"
                        onChange={(x) => setLastname(x.target.value)}
                    />
                    <br />
                    <label className="errorLabel">{lastnameErr}</label>
                </div>
                <div className="inputDiv">
                    <DatePicker
                        selected={birthdate}
                        onChange={(x) => setBirthdate(x)}
                        maxDate={new Date()}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                    />
                    <br />
                    <label className="errorLabel">{birthdateErr}</label>
                </div>
                <div className="inputDiv">
                    <input className="inputButton" type="button" onClick={onButtonClick} value={"Register"} />
                    <label className="errorLabel">{requestdErr}</label>
                </div>
            </div>
        </div>
    );
}
export default Register;


