import { useState } from "react";
import DatePicker from "react-datepicker";
import React from "react";
import NavBar from "./NavBar";

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




    const onButtonClick = () => {
        setUsernameErr("")
        setPasswordErr("")
        setConPasswordErr("")
        setEmailErr("")
        setFirstnameErr("")
        setLastnameErr("")
        setBirthdateErr("")

        // Lisää validaatiota tänne, jotta vastaa modelia

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

        if(conPassword === "") {
            setConPasswordErr("Enter your password")
        }
        else if(!/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{10,40}$/.test(conPassword)) {
            setConPasswordErr("Enter valid password")
        }
        else if(password !== conPassword) {
            setConPasswordErr("Passwords must be same")
        }

        if(email === "") {
            setEmailErr("Enter your email")
        }
        else if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr("Enter valid email")
        }

        if(firstname === "") {
            setFirstnameErr("Enter your first name")
        }

        if(lastname === "") {
            setLastnameErr("Enter your last name")
        }

        if(!birthdate) {
            setBirthdateErr("Set birthdate")
        }
        var age = (() => {
            var now = new Date();
            var ageYears = now.getFullYear() - birthdate.getFullYear();
            var ageMonths = now.getMonth - birthdate.getMonth();
            if(ageMonths < 0 || (ageMonths === 0 && now.getDate() < birthdate.getDate())) {
                ageYears--;
            }
            return ageYears;
        })();
        if(age < 18) {
            setBirthdateErr("Must be over 18")
        }

        fetch("http://localhost:3002/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, email, firstname, lastname, birthdate})
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
        })
        .catch((err) => {
            console.log(err);
        })

    }
    
    return (
        <div className="main">
            <NavBar />
            <div className="title">
                <h1>Register</h1>
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
            <input
                value={conPassword}
                placeholder="pasword"
                onChange={(x) => setConPassword(x.target.value)}
            />
            <br/>
            <label>{conPasswordErr}</label>
            </div>
            <div className="inputDiv4">
            <input
                value={email}
                placeholder="email"
                onChange={(x) => setEmail(x.target.value)}
            />
            <br/>
            <label>{emailErr}</label>
            </div>
            <div className="inputDiv5">
            <input
                value={firstname}
                placeholder="firstname"
                onChange={(x) => setFirstname(x.target.value)}
            />
            <br/>
            <label>{firstnameErr}</label>
            </div>
            <div className="inputDiv6">
            <input
                value={lastname}
                placeholder="lastname"
                onChange={(x) => setLastname(x.target.value)}
            />
            <br/>
            <label>{lastnameErr}</label>
            </div>
            <div className="inputDiv7">
            <DatePicker 
            selected={birthdate} 
            onChange={(x) => setBirthdate(x)} 
            maxDate={new Date()}
            showMonthDropdown 
            showYearDropdown
            dropdownMode="select"
            />
            <br/>
            <label>{birthdateErr}</label>
            </div>
            <div className="inputDiv8">
                <input className="inputButton" type="button" onClick={onButtonClick} value={"Login"} />
            </div>
        </div>
    );
}
export default Register;


