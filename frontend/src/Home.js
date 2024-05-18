import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

import "./Home.css";

const Home = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [loggedIn, setLoggedIn] = useState(false)
    const navigate = useNavigate();

    const onClickLogout = async () => {
        sessionStorage.removeItem("JWT_token");
        setLoggedIn(false);
        navigate("/");
    }

    useEffect(() => {
        if (sessionStorage.getItem("JWT_token")) {
            fetch("https://localhost:3001/auth", {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `${sessionStorage.getItem("JWT_token")}`
                }
            })
                .then((res) => {
                    if (res.status === 200) {
                        return res.json();
                    } else if (res.status === 401) {
                        throw new Error("Invalid Credentials")
                    }
                })
                .then((data) => {
                    //console.log(data);
                    setLoggedIn(true)
                    setUsername(data.sanitizedUser.username);
                    setEmail(data.sanitizedUser.email);
                    setFirstname(data.sanitizedUser.firstname);
                    setLastname(data.sanitizedUser.lastname)
                })
                .catch((err) => {
                    sessionStorage.removeItem("JWT_token");
                    console.log("ERROR: " + err.message);
                    setErrorMsg("Session Expired")
                })
        } else {
            setLoggedIn(false);
        }
    }, []);

    return (
        <div className="home">
            <NavBar />
            {loggedIn ? (
                <div className="infoGrid" >
                    <div>
                        <h1>User Info</h1>
                    </div>
                    <div className="userInfo">
                        <table className="userTable">
                            <tr>
                                <td>Username</td>
                                <td>{username}</td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td>{email}</td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>{firstname} {lastname}</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <button onClick={onClickLogout} className="logout">
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <h1>Home</h1>
            )}
            <label className="errorLabel">{errorMsg}</label>
        </div>
    );
}
export default Home;