import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  darkMode: boolean;
}

const initialState: AppState = {
  isLoading: false,
  darkMode: true, // As per the design guidelines - dark theme only
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
  },
});

export const { setLoading, toggleDarkMode } = appSlice.actions;
export default appSlice.reducer; 