import React, {useEffect, useState} from "react";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: '/' });

const Home = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const navigate = useNavigate();

    const onClickLogout = async () => {
        cookies.remove("JWT_TOKEN");
        navigate("/");
    }

    useEffect(() => {
        if(!cookies.get("JWT_TOKEN")) {
            console.log("Not logged in");
        } else {
            fetch("https://localhost:3001/auth", {
                method: "GET",
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${cookies.get("JWT_TOKEN")}`
                }
            })
            .then((res) => res.json())
            .then((data) => {
                //console.log(data);
                setUsername(data.sanitizedUser.username);
                setEmail(data.sanitizedUser.email);
                setFirstname(data.sanitizedUser.firstname);
                setLastname(data.sanitizedUser.lastname)
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }, []);

    return (
        <div className="home">
            <NavBar />
            {cookies.get("JWT_TOKEN") ? (
                <button onClick={onClickLogout} className="logout">
                    Logout
                </button>
            ) : (
                <h1>Home</h1>
            )}
            
        </div>
    );
}
export default Home;