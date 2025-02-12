import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import styles from "./loginpage.module.css"

const Loginpage = () => {
    const [showRegister, setShowRegister] = useState(false);

    const toggleRegister = () => {
        setShowRegister(prev => !prev);
    };

    return (
        <div className={styles.loginpage}>
            {showRegister ? (
                <Register toggleRegister={toggleRegister} />
            ) : (
                <Login toggleRegister={toggleRegister} />
            )}
        </div>
    );
};

export default Loginpage;
