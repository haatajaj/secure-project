import {passwordStrength} from 'check-password-strength';
import './PasswordStrength.css'



const PasswordStrength = (prop) => {
    let strength = passwordStrength(prop.password);

    let widths = ["1%", "33%", "66%", "100%"]; 
    let colors = ["#FF0000", "#FF4500", "#FFFF00", "#008000"]; 


    console.log(strength)
    return (
        <div className="strengthContainer"> 
            <div className="strengthBar" style={
                {width: widths[strength.id], "backgroundColor": colors[strength.id]}} /> 
        </div>
    );
}
export default PasswordStrength;