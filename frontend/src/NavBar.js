import {Link} from "react-router-dom";
import "./NavBar.css"

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to={sessionStorage.getItem("JWT_token") ? '/' : '/login'}>Login</Link></li>
                <li><Link to={sessionStorage.getItem("JWT_token") ? '/' : '/register'}>Register</Link></li>
            </ul>
        </nav>
    );
}
export default NavBar;