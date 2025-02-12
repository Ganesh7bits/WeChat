import  { useState, useRef, useEffect } from "react";
import styles from "./Login.module.css";
import { toast } from 'react-toastify';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import PropTypes from 'prop-types';
import ReCAPTCHA from "react-google-recaptcha";

const Login = ({ toggleRegister }) => {
  const [verify, setVerify] = useState(false);
  const recaptchaRef = useRef(null);

  // Debugging: Log verify state changes
  useEffect(() => {
    console.log("Verify state updated:", verify);
  }, [verify]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if captcha is verified
    if (!verify) {
      toast.error("Please complete the captcha.");
      return;
    }

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (err) {
      console.error("Error logging in:", err);
      toast.error(err.message);
    }
  };

  const handleLoginClick = () => {
    console.log("Verify state on button click:", verify); // Debugging
    if (!verify) {
      toast.error("Please fill up captcha");
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.text}>Login Form</div>
      <form onSubmit={handleLogin}>
        <div className={styles.field}>
          <input type="text" placeholder="email" name="email" required />
        </div>
        <div className={styles.field}>
          <input type="password" placeholder="password" name="password" required />
        </div>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LejbswqAAAAACO3NsGCk5FEFz2QUYNgGY0Hq7TY"
          onChange={() => {
            console.log("Captcha verified"); // Debugging
            setVerify(true);
          }}
        />
        <button
          className={styles.loginbtn}
          disabled={!verify}
          onClick={handleLoginClick}
        >
          Sign in
        </button>
        <div className={styles.sign_up}>
          Not a member?{" "}
          <a onClick={toggleRegister} style={{ cursor: "pointer" }}>
            Signup now
          </a>
        </div>
      </form>
    </div>
  );
};

Login.propTypes = {
  toggleRegister: PropTypes.func.isRequired,
};

export default Login;