import React, {useEffect, useState} from "react";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import './Register.css';

const Home = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const navigate = useNavigate();

    const onClickLogout = async () => {
        sessionStorage.removeItem("JWT_token");
        navigate("/");
    }

    useEffect(() => {
        console.log(sessionStorage.getItem("JWT_token"));
        if(!sessionStorage.getItem("JWT_token")) {
            setErrorMsg("not logged in");
        } else {
            fetch("https://localhost:3001/auth", {
                method: "GET",
                credentials: "include",
                headers: {
                    Authorization: `${sessionStorage.getItem("JWT_token")}`
                }
            })
            .then((res) => {
                if(res.status === 200) {
                    return res.json();
                } else if (res.status === 401) {
                    console.log("BODY: " + res.body.message);
                    throw new Error(res.body.message)
                }
                })
            .then((data) => {
                //console.log(data);
                setUsername(data.sanitizedUser.username);
                setEmail(data.sanitizedUser.email);
                setFirstname(data.sanitizedUser.firstname);
                setLastname(data.sanitizedUser.lastname)
            })
            .catch((err) => {
                sessionStorage.removeItem("JWT_token");
                console.log("ERROR: " + err.message);
                setErrorMsg(err.message)
            })
        }
    }, []);

    return (
        <div className="home">
            <NavBar />
            {sessionStorage.getItem("JWT_token") ? (
                <div>
                    <table>
                        <tr>
                            <th>User Info</th>
                        </tr>
                        <tr>
                            <th>{username}</th>
                        </tr>
                        <tr>
                            <th>{email}</th>
                        </tr>
                        <tr>
                            <th>{firstname} {lastname}</th>
                        </tr>
                    </table>

                    <button onClick={onClickLogout} className="logout">
                        Logout
                    </button>
                </div>
            ) : (
                <h1>Home</h1>
            )}
            <label className="errorLabel">{errorMsg}</label>
        </div>
    );
}
export default Home;