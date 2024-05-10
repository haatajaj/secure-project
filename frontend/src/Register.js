import { useState } from "react";
import DatePicker from "react-datepicker";
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
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
    
    const [check, setCheck] = useState(0)

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
        // Lisää validaatiota tänne, jotta vastaa modelia

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

        if(conPassword === "") {
            setConPasswordErr("Enter password, must contain 10-40 letters, capitalized, uncapitalized and a number")
            check = 1;
        }
        else if(!/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{10,40}$/.test(conPassword)) {
            setConPasswordErr("Invalid, must contain 10-40 letters, capitalized, uncapitalized and a number")
            check = 1;
        }
        else if(password !== conPassword) {
            setConPasswordErr("Passwords must be same")
            check = 1;
        }

        if(email === "") {
            setEmailErr("Enter your email")
            check = 1;
        }
        else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailErr("Enter valid email")
            check = 1;
        }

        if(firstname === "") {
            setFirstnameErr("Enter your first name")
            check = 1;
        }

        if(lastname === "") {
            setLastnameErr("Enter your last name")
            check = 1;
        }

        if(!birthdate) {
            setBirthdateErr("Set birthdate")
            check = 1;
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

        if(check === 1) {
                console.log("Invalid form")
        } else {

            fetch("https://localhost:3001/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password, email, firstname, lastname, birthdate})
            })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
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
                <h1>Register</h1>
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
            <input
                value={conPassword}
                placeholder="pasword"
                onChange={(x) => setConPassword(x.target.value)}
            />
            <br/>
            <label className="errorLabel">{conPasswordErr}</label>
            </div>
            <div className="inputDiv">
            <input
                value={email}
                placeholder="email"
                onChange={(x) => setEmail(x.target.value)}
            />
            <br/>
            <label className="errorLabel">{emailErr}</label>
            </div>
            <div className="inputDiv">
            <input
                value={firstname}
                placeholder="firstname"
                onChange={(x) => setFirstname(x.target.value)}
            />
            <br/>
            <label className="errorLabel">{firstnameErr}</label>
            </div>
            <div className="inputDiv">
            <input
                value={lastname}
                placeholder="lastname"
                onChange={(x) => setLastname(x.target.value)}
            />
            <br/>
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
            <br/>
            <label className="errorLabel">{birthdateErr}</label>
            </div>
            <div className="inputDiv">
                <input className="inputButton" type="button" onClick={onButtonClick} value={"Login"} />
            </div>
        </div>
    );
}
export default Register;


