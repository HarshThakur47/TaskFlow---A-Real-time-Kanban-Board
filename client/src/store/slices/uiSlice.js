import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  showCreateBoardModal: false,
  showCreateListModal: false,
  showCreateCardModal: false,
  showCardModal: false,
  showAddMemberModal: false,
  showBoardSettingsModal: false,
  showUserProfileModal: false, // NEW
  
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
    // ... existing reducers
    openCreateBoardModal: (state) => { state.showCreateBoardModal = true; },
    closeCreateBoardModal: (state) => { state.showCreateBoardModal = false; },
    openCreateListModal: (state) => { state.showCreateListModal = true; },
    closeCreateListModal: (state) => { state.showCreateListModal = false; },
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
    openAddMemberModal: (state) => { state.showAddMemberModal = true; },
    closeAddMemberModal: (state) => { state.showAddMemberModal = false; },
    openBoardSettingsModal: (state) => { state.showBoardSettingsModal = true; },
    closeBoardSettingsModal: (state) => { state.showBoardSettingsModal = false; },

    // NEW: User Profile Modal Actions
    openUserProfileModal: (state) => {
      state.showUserProfileModal = true;
    },
    closeUserProfileModal: (state) => {
      state.showUserProfileModal = false;
    },
    
    // ... rest of reducers
    setLoading: (state, action) => { state.isLoading = action.payload; },
    addNotification: (state, action) => {
      const notification = { id: Date.now(), type: 'info', message: '', ...action.payload };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => { state.notifications = []; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    closeSidebar: (state) => { state.sidebarOpen = false; },
    
    clearModals: (state) => {
      state.showCreateBoardModal = false;
      state.showCreateListModal = false;
      state.showCreateCardModal = false;
      state.showCardModal = false;
      state.showAddMemberModal = false;
      state.showBoardSettingsModal = false;
      state.showUserProfileModal = false; // NEW
      state.selectedCard = null;
      state.selectedListId = null;
    },
  },
});

export const {
  openCreateBoardModal, closeCreateBoardModal,
  openCreateListModal, closeCreateListModal,
  openCreateCardModal, closeCreateCardModal,
  openCardModal, closeCardModal,
  openAddMemberModal, closeAddMemberModal,
  openBoardSettingsModal, closeBoardSettingsModal,
  openUserProfileModal, closeUserProfileModal, // NEW
  setLoading, addNotification, removeNotification, clearNotifications,
  toggleSidebar, closeSidebar, clearModals,
} = uiSlice.actions;

export default uiSlice.reducer;