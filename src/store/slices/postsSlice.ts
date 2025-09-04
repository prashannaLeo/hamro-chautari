import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PostUser {
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  post_type: 'text' | 'image' | 'video' | 'mixed';
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  mood_tag?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  profiles: PostUser;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  drafts: Partial<Post>[];
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  drafts: [],
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action: PayloadAction<{ id: string; updates: Partial<Post> }>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = { ...state.posts[index], ...action.payload.updates };
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload);
    },
    toggleLike: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes_count += post.isLiked ? 1 : -1;
      }
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const post = state.posts.find(p => p.id === action.payload);
      if (post) {
        post.isBookmarked = !post.isBookmarked;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addDraft: (state, action: PayloadAction<Partial<Post>>) => {
      state.drafts.push(action.payload);
    },
    updateDraft: (state, action: PayloadAction<{ index: number; updates: Partial<Post> }>) => {
      const { index, updates } = action.payload;
      if (state.drafts[index]) {
        state.drafts[index] = { ...state.drafts[index], ...updates };
      }
    },
    deleteDraft: (state, action: PayloadAction<number>) => {
      state.drafts.splice(action.payload, 1);
    },
  },
});

export const {
  setPosts,
  addPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  setLoading,
  setError,
  addDraft,
  updateDraft,
  deleteDraft,
} = postsSlice.actions;

export default postsSlice.reducer;