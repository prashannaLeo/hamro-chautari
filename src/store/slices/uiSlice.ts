import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currentModal: string | null;
  loading: {
    global: boolean;
    posts: boolean;
    auth: boolean;
  };
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  animations: {
    reduceMotion: boolean;
    enableConfetti: boolean;
  };
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  currentModal: null,
  loading: {
    global: false,
    posts: false,
    auth: false,
  },
  toast: {
    show: false,
    message: '',
    type: 'info',
  },
  animations: {
    reduceMotion: false,
    enableConfetti: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCurrentModal: (state, action: PayloadAction<string | null>) => {
      state.currentModal = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    showToast: (state, action: PayloadAction<{ message: string; type: UIState['toast']['type'] }>) => {
      state.toast = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideToast: (state) => {
      state.toast.show = false;
    },
    setAnimationSettings: (state, action: PayloadAction<Partial<UIState['animations']>>) => {
      state.animations = { ...state.animations, ...action.payload };
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setCurrentModal,
  setLoading,
  showToast,
  hideToast,
  setAnimationSettings,
} = uiSlice.actions;

export default uiSlice.reducer;