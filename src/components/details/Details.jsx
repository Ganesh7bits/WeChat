import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import styles from "./Details.module.css";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import PropTypes from "prop-types";
import { useUserStore } from "../../lib/userstore";

const Details = ({ handleFontSizeChange, onBack }) => {
  const { user,isCurrentUserBlocked, isReceiverBlocked, changeBlock} = useChatStore();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useUserStore();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user && user.id) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.id));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserInfo();
  }, [user,isCurrentUserBlocked]);

  const handleBlock = async()=>{
    if(!user) return;
    const userChatRef= doc(db,"users", currentUser.id)
    try{
      await updateDoc(userChatRef,{
        blocked:isReceiverBlocked? arrayRemove(user.id): arrayUnion(user.id),
      });
      changeBlock()

    }catch(err){
      console.log(err)
    }
  }

  return (
    <div className={styles.details}>
      {/* Back Button for Mobile */}
      {window.screen.width <= 830 && (
        <div onClick={onBack} className={styles.backButton} aria-label="Go back to chat">
        </div>
      )}
      <div className={styles.user}>
        <img src={user.avatarUrl || "./avatar.png"} alt="User Avatar" />
        <h2>{loading ? "Loading..." : userInfo?.username || ""}</h2>
        <p>{loading ? "Loading..." : userInfo?.status || ""}</p>
      </div>
      <div className={styles.info}>
        <div className={styles.options}>
          <div className={styles.title}>
            <span>Chat Setting</span>
            {/* <img src="./arrowUp.png" alt="Toggle Chat Settings"  /> */}
          </div>
          <div className={styles.font_size_box}>
        <span>Chat Font-Size</span>
        <button onClick={() => handleFontSizeChange(-2)}>-</button>
        <button onClick={() => handleFontSizeChange(+2)}>+</button>
      </div>
        </div>
        <div className={styles.blockedStatus}>
        {isCurrentUserBlocked && <p>{user.username} Blocked you</p>}
        {isReceiverBlocked && <p>You Blocked {user.username} </p>}
        </div>
        <button className={styles.blockBtn} aria-label="Block User"
        onClick={handleBlock}>
         {isReceiverBlocked
            ? "Unblocked user"
            : "Blocked User"}
        </button>
        <button
          className={styles.logOutBtn}
          onClick={() => auth.signOut()}
          aria-label="Log Out"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

Details.propTypes = {
  handleFontSizeChange: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default Details;