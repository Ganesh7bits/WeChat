
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from "firebase/auth";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY ,
  authDomain: "chat-app-f43a9.firebaseapp.com",
  projectId: "chat-app-f43a9",
  storageBucket: "chat-app-f43a9.firebasestorage.app",
  messagingSenderId: "817966620880",
  appId: "1:817966620880:web:5466486f2e6eb3e8c27ed5",
  measurementId: "G-BW8GZ4CD8L"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth= getAuth();
export const db = getFirestore();
export const storage= getStorage();
