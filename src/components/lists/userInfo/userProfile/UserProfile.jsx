import styles from "./userProfile.module.css"
import { useUserStore } from "../../../../lib/userstore"
import {  useState } from "react";
import uploadImage from "../../../../lib/uploadimg";
import { doc,  updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
const UserProfile = () => {
    const { currentUser} = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(currentUser.status || "");


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
        const handleUpdateDP=async()=>{
            console.log(currentUser.id)
            setIsLoading(true);
            let imageUrl = "";
            // Upload avatar if selected
            if (avatar.file) {
                imageUrl = await uploadImage(avatar.file);
            }
            try{

            if(imageUrl){
             await updateDoc(doc(db, "users",currentUser.id), {
                            avatarUrl: imageUrl ,
                            
                            
                        });
                        toast.success("sucessfully change dp")
                    }  
                }catch(err){
                    console.log(err)
                }  finally {
                    setIsLoading(false);
                }     

        }
        const handleStatusChange = (event) => {
            setStatus(event.target.value);
                 
                        
        }
        const handleStatusUpdate = async() => {
            await updateDoc(doc(db, "users",currentUser.id), {
                status:status,// Store image URL in Firestore
                
                
            });
            toast.success("sucessfully change status");    
                        
        }

  return (
    <div className={styles.userProfile}>
        <div className={styles.profile}>
        
            <img src={avatar.url || currentUser.avatarUrl} alt="" />
        <label htmlFor="file">
            choose new DP
        </label>
        <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
        />
        <button onClick={handleUpdateDP} disabled={isLoading}>Update DP</button>
        
        
        <h1>{currentUser.username}</h1>
        </div>
        <div className={styles.about}>
            <h2>Status</h2>
           <input type="text"  value={status} placeholder={currentUser.status}
            onChange={handleStatusChange}
            />
            <button onClick={handleStatusUpdate}>Update status</button>
        </div>
    </div>
  )
}

export default UserProfile