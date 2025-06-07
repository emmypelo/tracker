/* eslint-disable no-useless-catch */
import axios from "axios";

import { backendURL } from "../utils/backendURL.js";

const baseUrl = `${backendURL}/api/users`;
// ? create User API
export const registerUserApi = async (userData) => {
  const { data } = await axios.post(`${baseUrl}/register`, userData, {
    withCredentials: true,
  });

  return data;
};

// Check Email
export const checkUserApi = async (email) => {
  try {
    const { data } = await axios.post(
      `${baseUrl}/check`,
      { email },
      {
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

// Check Username
export const checkUsernameApi = async (username) => {
  try {
    const { data } = await axios.post(
      `${baseUrl}/checkusername`,
      { username },
      {
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

// Login
export const loginUserApi = async (userData) => {
  const { data } = await axios.post(`${baseUrl}/login`, userData, {
    withCredentials: true,
  });

  return data;
};

// Check Auth Status
export const checkAuthApi = async () => {
  const { data } = await axios.get(`${baseUrl}/checkauth`, {
    withCredentials: true,
  });

  return data;
};

// Logout
export const logoutApi = async () => {
  const { data } = await axios.post(
    `${baseUrl}/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return data;
};

export const fetchAllUsersApi = async () => {
  const { data } = await axios.get(`${baseUrl}`, {
    withCredentials: true,
  });

  return data;
};

// Fetch a single user
export const fetchAUserApi = async (userId) => {
  const { data } = await axios.get(`${baseUrl}/${userId}`, {
    withCredentials: true,
  });

  return data;
};

// Delete a user
export const deleteUserApi = async (userId) => {
  const { data } = await axios.delete(`${baseUrl}/${userId}`, {
    withCredentials: true,
  });

  return data;
};

// Edit user profile
export const editUserProfileApi = async (userId, userData) => {
  const { data } = await axios.put(`${baseUrl}/${userId}`, userData, {
    withCredentials: true,
  });

  return data;
};

// Admin edit user
export const adminEditUserApi = async (userId, userData) => {
  const { data } = await axios.put(`${baseUrl}/admin/${userId}`, userData, {
    withCredentials: true,
  });

  return data;
};

export const forgotPasswordApi = async (email) => {
  const response = await axios.post(
    `${baseUrl}/forgot-password`,
    {
      email,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const resetPasswordApi = async (data) => {
  const response = await axios.post(
    `${baseUrl}/reset-password/${data?.verifyToken}`,
    {
      password: data?.password,
      confirmPassword: data?.confirmPassword,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};
export const changePasswordApi = async (userId, passwords) => {
  const { data } = await axios.put(
    `${baseUrl}/${userId}/change-password`,
    passwords,
    {
      withCredentials: true,
    }
  );
  return data;
};
