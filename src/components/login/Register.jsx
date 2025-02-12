import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../../lib/firebase";
import uploadImage from "../../lib/uploadimg";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import styles from "./Register.module.css";
import PropTypes from 'prop-types'


const Register = ({ toggleRegister }) => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });
    
    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatar({
                file: file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            // Check if username already exists
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                toast.error("Username already exists. Please choose a different one.");
                return;
            }

            // If username is unique, proceed with registration
            const res = await createUserWithEmailAndPassword(auth, email, password);

            let imageUrl = "";
            // Upload avatar if selected
            if (avatar.file) {
                imageUrl = await uploadImage(avatar.file);
            }

            // Store user data in Firestore
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                blocked: [],
                avatarUrl: imageUrl // Store image URL in Firestore
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: []
            });

            toast.success("Account created!");
        } catch (err) {
            console.error("Error registering:", err);
            toast.error(err.message);
        }
    };

    return (
        <div className={styles.content}>
    <div className={styles.text}>
       Registered Form
    </div>
    <form onSubmit={handleRegister}>
        <label htmlFor="file">
            <img src={avatar.url || "avatar.png"} alt="" />
            Upload file here
        </label>
        <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
        />
        
        <div className={styles.field}>
            <input type="text" placeholder="usernamel" name="username"/>
            <label>Username</label>
         </div>
       <div className={styles.field}>
          <input type="text" placeholder="email" name="email"/>
          <label>Email</label>
       </div>
       <div className={styles.field}>
          <input type="password" placeholder="password" name="password"/>
          {/* <span class="fas fa-lock"></span> */}
          <label>Password</label>
       </div>
       
       <button className={styles.loginbtn}>Sign up</button>
       <div className={styles.sign_up}>
          Already a member?
          <a  onClick={toggleRegister}>signin now</a >
       </div>
    </form>
 </div>
    );
};
Register.propTypes = {
   toggleRegister: PropTypes.func.isRequired,
};

export default Register;
