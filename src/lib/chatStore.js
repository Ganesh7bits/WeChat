import { create } from 'zustand';
import { useUserStore } from './userstore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
   
      
    changeChat: (chatId, user) => {
        set((state) => {
            const currentUser = useUserStore.getState().currentUser;

            // Handle null/undefined user or currentUser
            if (!user || !currentUser) {
                console.error("User or currentUser is undefined or null.");
                return {
                    ...state,
                    chatId,
                    user: null,
                    isCurrentUserBlocked: false,
                    isReceiverBlocked: false,
                };
            }

            // Check if the current user is blocked by the receiver
            const isCurrentUserBlocked = user.blocked && user.blocked.includes(currentUser.id);

            // Check if the receiver is blocked by the current user
            const isReceiverBlocked = currentUser.blocked && currentUser.blocked.includes(user.id);

            // Return the updated state
            return {
                ...state,
                chatId,
                user,
                isCurrentUserBlocked,
                isReceiverBlocked,
            };
        });
    },

    changeBlock: () => {
        set((state) => {
            // Toggle isReceiverBlocked based on the current state
            const updatedIsReceiverBlocked = !state.isReceiverBlocked;

            // Return the updated state with the toggled value
            return {
                ...state, // Spread the existing state to avoid overwriting other properties
                isReceiverBlocked: updatedIsReceiverBlocked,
            };
        });
    }
}));
