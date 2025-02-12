import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import styles from "./adduser.module.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userstore";


const Adduser = () => {
  const [user,setUser]= useState(null)
  const {currentUser} = useUserStore()
  const [isAdding, setIsAdding] = useState(false);

   const handleSearch= async e=>{
    e.preventDefault();
    const formData = new FormData(e.target);
    const username =formData.get("username")

    try{
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot =await getDocs(q);
      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data());
      }else 
        setUser(null);

    }catch(err){
      console.log(err)
    }
   }

   const handleAdd = async e => {
    e.preventDefault();
    if (isAdding) return; // Prevent multiple submissions
  
    setIsAdding(true); // Lock button
    try {
   
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
  
    try {
      // Check if the user being added is the current user
    if (user.id === currentUser.id) {
      console.log("You cannot add yourself.");
      return;
    }

      // Check if a user already exists
    const userChatsSnap = await getDoc(doc(userChatsRef, currentUser.id));
    const userChatsData = userChatsSnap.data();

    if (userChatsData && userChatsData.chats.some(chat => chat.receiverId === user.id)) {
      console.log("Chat with this user already exists");
      return;
    }
      
    // Create a new user if it doesn't exist
    
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAT: serverTimestamp(),
        messages: [],
      });
  
      const userChatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAT: Date.now(),
      };
  
      const currentUserChatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: user.id,
        updatedAT: Date.now(),
      };
  
      await setDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion(userChatData)
      }, { merge: true });
  
      await setDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion(currentUserChatData)
      }, { merge: true });
  
    } catch (err) {
      console.log(err);
    }
  }
finally {
  setIsAdding(false); // Unlock button
}
};
  
  

  return (
    <div className={styles.adduser}>
        <form onSubmit={handleSearch} >
            <input type="text" placeholder="username" name="username"/>
            <button >Search</button>
        </form>
       {user && < div className={styles.user}>
            <div className={styles.details}>
                <img src={user.avatarUrl} alt="" />
                <span>{user.username}</span>

            </div>
            <button onClick={handleAdd}>Add User</button>
        </div>}
    </div>
  )
}

export default Adduser