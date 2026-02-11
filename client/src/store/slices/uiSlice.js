import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  showCreateBoardModal: false,
  showCreateListModal: false,
  showCreateCardModal: false,
  showCardModal: false,
  showAddMemberModal: false,
  showBoardSettingsModal: false, // NEW
  
  // Selected items
  selectedCard: null,
  selectedListId: null,
  
  // Loading states
  isLoading: false,
  
  // Notifications
  notifications: [],
  
  // Sidebar
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openCreateBoardModal: (state) => {
      state.showCreateBoardModal = true;
    },
    closeCreateBoardModal: (state) => {
      state.showCreateBoardModal = false;
    },
    
    openCreateListModal: (state) => {
      state.showCreateListModal = true;
    },
    closeCreateListModal: (state) => {
      state.showCreateListModal = false;
    },
    
    openCreateCardModal: (state, action) => {
      state.showCreateCardModal = true;
      state.selectedListId = action.payload?.listId || null;
    },
    closeCreateCardModal: (state) => {
      state.showCreateCardModal = false;
      state.selectedListId = null;
    },
    
    openCardModal: (state, action) => {
      state.showCardModal = true;
      state.selectedCard = action.payload;
    },
    closeCardModal: (state) => {
      state.showCardModal = false;
      state.selectedCard = null;
    },
    
    openAddMemberModal: (state) => {
      state.showAddMemberModal = true;
    },
    closeAddMemberModal: (state) => {
      state.showAddMemberModal = false;
    },

    openBoardSettingsModal: (state) => { // NEW
      state.showBoardSettingsModal = true;
    },
    closeBoardSettingsModal: (state) => { // NEW
      state.showBoardSettingsModal = false;
    },
    
    // Loading actions
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        message: '',
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },
    
    // Clear all modals
    clearModals: (state) => {
      state.showCreateBoardModal = false;
      state.showCreateListModal = false;
      state.showCreateCardModal = false;
      state.showCardModal = false;
      state.showAddMemberModal = false;
      state.showBoardSettingsModal = false; // NEW
      state.selectedCard = null;
      state.selectedListId = null;
    },
  },
});

export const {
  // Modal actions
  openCreateBoardModal,
  closeCreateBoardModal,
  openCreateListModal,
  closeCreateListModal,
  openCreateCardModal,
  closeCreateCardModal,
  openCardModal,
  closeCardModal,
  openAddMemberModal,
  closeAddMemberModal,
  openBoardSettingsModal, // NEW
  closeBoardSettingsModal, // NEW
  
  // Loading actions
  setLoading,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Sidebar actions
  toggleSidebar,
  closeSidebar,
  
  // Utility actions
  clearModals,
} = uiSlice.actions;

export default uiSlice.reducer;