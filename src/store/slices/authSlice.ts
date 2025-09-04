import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    mood?: string;
    is_verified?: boolean;
  } | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  profile: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProfile: (state, action: PayloadAction<AuthState['profile']>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<AuthState['profile']>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.loading = false;
    },
  },
});

export const { setAuth, setLoading, setProfile, updateProfile, clearAuth } = authSlice.actions;
export default authSlice.reducer;