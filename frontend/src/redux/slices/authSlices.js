import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userAuth: null,
    isLoading: true,
  },
  reducers: {
    login: (state, action) => {
      state.userAuth = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.userAuth = null;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = authSlice.actions;
export const authReducer = authSlice.reducer;
