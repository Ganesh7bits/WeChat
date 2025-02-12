// ChatList.js
import { useEffect, useState } from "react";
import styles from "./Chatlist.module.css";
import Adduser from "./adduser/Adduser";
import { useUserStore } from "../../../lib/userstore";
import { arrayRemove, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import Loading from "../../loading/Loading";
import PropTypes from "prop-types";
import ConfirmationModal from "../../conformModel/ConfirmationModal";

const ChatList = ({ onChatSelect }) => {  // Accept the function as a prop
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();
        return { ...item, user };
      });
      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      setFilteredChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  useEffect(() => {
    const filtered = chats.filter(chat =>
      chat.user?.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  const handleSelect = async (chat) => {
    if (chat.user) {
      changeChat(chat.chatId, chat.user);
      onChatSelect();  // Toggle the view on chat selection
    } else {
      console.error("Chat user is undefined or null.");
    }
  };

  const handleDeleteChat = async (chatId, receiverId) => {
    try {
      // Fetch the current user's userchats document
      const currentUserChatsRef = doc(db, "userchats", currentUser.id);
      const currentUserChatsSnap = await getDoc(currentUserChatsRef);
  
      if (currentUserChatsSnap.exists()) {
        const currentUserChats = currentUserChatsSnap.data().chats;
  
        // Find the exact chat object to remove
        const chatToRemove = currentUserChats.find(
          (chat) => chat.chatId === chatId && chat.receiverId === receiverId
        );
  
        if (chatToRemove) {
          // Remove the chat reference from the current user's userchats
          await updateDoc(currentUserChatsRef, {
            chats: arrayRemove(chatToRemove),
          });
        }
      }
  
      // Fetch the other user's userchats document
      const otherUserChatsRef = doc(db, "userchats", receiverId);
      const otherUserChatsSnap = await getDoc(otherUserChatsRef);
  
      if (otherUserChatsSnap.exists()) {
        const otherUserChats = otherUserChatsSnap.data().chats;
  
        // Find the exact chat object to remove
        const chatToRemove = otherUserChats.find(
          (chat) => chat.chatId === chatId && chat.receiverId === currentUser.id
        );
  
        if (chatToRemove) {
          // Remove the chat reference from the other user's userchats
          await updateDoc(otherUserChatsRef, {
            chats: arrayRemove(chatToRemove),
          });
        }
      }
  
      // Delete the chat document from the chats collection
      const chatRef = doc(db, "chats", chatId);
      await deleteDoc(chatRef);
  
      // Update the local state to remove the deleted chat
      setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
      setFilteredChats((prevChats) =>
        prevChats.filter((chat) => chat.chatId !== chatId)
      );
  
      console.log("Chat deleted successfully");
    } catch (err) {
      console.error("Error deleting chat: ", err);
    }
  };

  const handleDeleteClick = (chatId, receiverId) => {
    setChatToDelete({ chatId, receiverId });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      await handleDeleteChat(chatToDelete.chatId, chatToDelete.receiverId);
      setShowModal(false);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setChatToDelete(null);
  };



  return (
    <div className={styles.chatlist}>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <div className={styles.search}>
            <div className={styles.searchbar}>
              <img src="./search.png" alt="" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <img
              src={addMode ? "./minus.png" : "./plus.png"}
              alt=""
              className={styles.add}
              onClick={() => setAddMode((prev) => !prev)}
            />
          </div>
          {filteredChats.map((chat) => (
            <div
              className={styles.item}
              key={chat.chatId}
              onClick={() => handleSelect(chat)}
            >
              <img src={chat.user.avatarUrl || "avatar.png"} alt="" />
              <div className={styles.texts}>
                <span>{chat.user?.username || "Unknown User"}</span>
                <p>{chat.lastMessage}</p>
              </div>
              <div className={styles.dltbtndiv}>
              <button className={styles.dltChatBtn}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the chat selection
                  handleDeleteClick(chat.chatId, chat.user.id);
                }}
              >
              </button>
              </div>
            </div>
          ))}
          {addMode && <Adduser />}
        </div>
      )}

      {showModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this chat?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

    </div>
  );
};
ChatList.propTypes = {
  onChatSelect : PropTypes.func.isRequired,
};
export default ChatList;
