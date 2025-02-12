// Lists.js
import styles from "./Lists.module.css";
import Userinfo from "./userInfo/Userinfo";
import ChatList from "./chatList/ChatList";
import PropTypes from 'prop-types'

const Lists = ({ onChatSelect }) => {  // Accept the function as a prop
  return (
    <div className={styles.lists}>
      <Userinfo />
      <ChatList onChatSelect={onChatSelect} /></div>
  );
}
Lists.propTypes = {
  onChatSelect: PropTypes.func.isRequired,
};
export default Lists;
