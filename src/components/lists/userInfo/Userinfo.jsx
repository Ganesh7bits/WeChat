import { useUserStore } from "../../../lib/userstore";
import styles from "./Userinfo.module.css";
import { auth } from "../../../lib/firebase";
import { useState } from "react";
import UserProfile from "./userProfile/UserProfile";


const Userinfo = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const [editProfile,setEditProfile] =useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null); // Update the state to reflect logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>; // Show loading state if currentUser is not available
  }

  return (
    <div className={styles.userinfo}>
      <div className={styles.user}>
        <img className={styles.userimg} src={currentUser.avatarUrl || "avatar.png"} alt="User Avatar" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className={styles.icons}>
        <img src="./edit.png" alt="Edit"  onClick={() => setEditProfile((prev) => !prev)}/>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}></button>
      {editProfile && <UserProfile/>}

    </div>
    
  );
};

export default Userinfo;
