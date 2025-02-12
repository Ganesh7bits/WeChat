import { useState, useEffect, useRef } from "react";
import styles from "./Chat.module.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userstore";
import uploadImage from "../../lib/uploadimg";
import PropTypes from "prop-types";
import { format } from 'date-fns';

const Chat = ({ fontSize, toggleDetailPage, onBack }) => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);
 
  


  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Fetch chat data in real-time
  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        setChat(res.data());
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching chat data:", err);
        setLoading(false);
      }
    );

    return () => unSub();
  }, [chatId]);

  // Handle emoji selection
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // Handle image upload
  const handleImg = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const imgUrl = await uploadImage(file);
        await handleSend("", imgUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }
  };

  // Send a message or image
  const handleSend = async (messageText = "", imageUrl = null) => {
    if (!messageText && !imageUrl) return;

    try {
      // Update the chat with the new message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: messageText,
          createAt: new Date(),
          ...(imageUrl && { img: imageUrl }),
        }),
      });

      // Update last message in user chats
      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatSnapShot = await getDoc(userChatsRef);

        if (userChatSnapShot.exists()) {
          const userChatsData = userChatSnapShot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          userChatsData.chats[chatIndex] = {
            ...userChatsData.chats[chatIndex],
            lastMessage: messageText || "Image",
            isSeen: id === currentUser.id,
            updateAt: Date.now(),
          };

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }

    setText("");
  };

  return (
    <div className={styles.chat}>
      {/* Top Bar */}
      <div className={styles.top}>
        <div className={styles.backBtnBox}>
        <div onClick={onBack} className={styles.backButton} aria-label="Go back"></div>
        </div>
        <div className={styles.user}>
          <img src={user.avatarUrl || "./avatar.png"} alt={`${user.username}'s avatar`} />
          <div className={styles.texts}>
            <span>{user.username}</span>
            <p>{user.status || "Stay Home Stay Connected"}</p>
          </div>
        </div>
        <div className={styles.icons}>

          <img src="./info.png" alt="Toggle details" onClick={toggleDetailPage} />
        </div>
      </div>

      {/* Chat Messages */}
      <div className={styles.center} >
        {loading ? (
          <p>Loading messages...</p>
        ) : (
          chat?.messages?.map((message) => (
            <div
              className={message.senderId === currentUser.id ? styles.ourmessage : styles.message}
              key={message?.createAt}
            >
              
              
              <div className={styles.mgtexts} style={{ fontSize: `${fontSize}px` }}>
                {message.text && <p>{message.text} {message.createAt && <span>{format(message.createAt.toDate(), 'HH:mm')}</span>}</p>}
                
                {message.img && <img src={message.img} alt="Uploaded content" className={styles.messageImg} />}
                {/* {message.createAt && <p>{message.createAt.toDate().toLocaleString()}</p>} */}
                 

              </div >
              

             
            </div>
          ))
        )}
        <div ref={endRef}></div>
      </div>

      {/* Bottom Input Bar */}
      <div className={styles.bottom}>
        <div className={styles.icons}>
          <label htmlFor="file" aria-label="Upload image">
            <img src="img.png" alt="Upload image" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg}  />
        </div>
        <input
          type="text"
          placeholder={(isCurrentUserBlocked ||isReceiverBlocked)?"You cannot send message": "Type your message here"}
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked ||isReceiverBlocked}
        />
        <div className={styles.emoji}>
          <img src="./emoji.png" alt="Open emoji picker" onClick={() => setOpen((prev) => !prev)} />
          <div className={styles.picker}>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className={styles.sendbtn}
          onClick={() => handleSend(text)}
          disabled={(isCurrentUserBlocked ||isReceiverBlocked)}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

Chat.propTypes = {
  fontSize: PropTypes.number.isRequired,
  toggleDetailPage: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default Chat;