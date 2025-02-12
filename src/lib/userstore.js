import {create}from 'zustand';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase';

export const useUserStore = create((set) => ({
    currentUser: null,
    fetchUserInfo: async (uid) => {
        if (!uid) {
            set({ currentUser: null });
            return;
        }

        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                set({ currentUser: docSnap.data() });
            } else {
                set({ currentUser: null });
            }
        } catch (err) {
            console.log(err);
            set({ currentUser: null });
        }
    },
    setCurrentUser: (user) => set({ currentUser: user }), // Add setCurrentUser method
}));
