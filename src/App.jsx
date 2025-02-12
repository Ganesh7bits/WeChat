import { useEffect, useState } from "react";
import styles from "./App.module.css";
import Chat from "./components/chat/Chat";
import Lists from "./components/lists/Lists";
import Details from "./components/details/Details";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userstore";
import { useChatStore } from "./lib/chatStore";
import Loginpage from "./components/login/Loginpage";
import Loading from "./components/loading/Loading";

function App() {
  const [loading, setLoading] = useState(true);
  const [showDetailTab, setShowDetailTab] = useState(false);
  const [showChat, setShowChat] = useState(false); // State for toggling views on mobile
  const [fontSize, setFontSize] = useState(16); // Font size state
  const { currentUser, fetchUserInfo, setCurrentUser } = useUserStore();
  const { chatId } = useChatStore();
  const isMobile = window.screen.width <= 830;

  // Toggle Details component
  const toggleDetailPage = () => {
    if (isMobile) {
      // On mobile, toggle Details and hide Chat
      setShowDetailTab((prev) => !prev);
      setShowChat(false);
    } else {
      // On desktop, simply toggle Details
      setShowDetailTab((prev) => !prev);
    }
  };
  // Handle chat selection (for mobile)
  const handleChatSelect = () => {
    if (isMobile) {
      setShowChat(true); // Show chat on mobile
      setShowDetailTab(false); // Hide Details when Chat is shown
    }
  };

 // Handle back to list (for mobile)
 const handleBackToList = () => {
  if (isMobile) {
    setShowChat(false); // Show list on mobile
    setShowDetailTab(false); // Hide Details when List is shown
  }
};

// Handle back to chat from Details (for mobile)
const handleBackToChat = () => {
  if (isMobile) {
    setShowChat(true); // Show chat on mobile
    setShowDetailTab(false); // Hide Details when Chat is shown
  }
};
  const handleFontSizeChange = (change) => {
    setFontSize((prevFontSize) => {
      const newSize = prevFontSize + change;
      // Ensure font size doesn't go below a minimum or above a maximum
      return Math.max(12, Math.min(32, newSize)); // Example: Min 12px, Max 24px
    });
  };

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserInfo(user.uid);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo, setCurrentUser]);

  return (
    <div className={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        currentUser ? (
          <>
           {/* Show Lists component only if not on mobile, or if neither Chat nor Details is shown */}
           {(!isMobile || (!showChat && !showDetailTab)) && (
            <Lists onChatSelect={handleChatSelect} />
          )}

          {/* Show Chat component if not on mobile or if Chat is shown */}
          {!isMobile || showChat ? (
            chatId && (
              <Chat
                fontSize={fontSize}
                toggleDetailPage={toggleDetailPage}
                onBack={handleBackToList}
              />
            )
          ) : null}

          {/* Show Details component only if showDetailTab is true */}
          
          {showDetailTab && (
            <Details
              handleFontSizeChange={handleFontSizeChange}
              onBack={handleBackToChat} // Pass onBack prop
            />
          )}
        </>
        ) : (
          <Loginpage />
        )
      )}
      <Notification />
    </div>
  );
}

export default App;