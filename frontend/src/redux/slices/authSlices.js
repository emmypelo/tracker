import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userAuth: null,
  },
  reducers: {
    login: (state, action) => {
      state.userAuth = action.payload;
    },
    logout: (state) => {
      state.userAuth = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
