import axios from "axios";

// name, username, email, password, passMatch
const baseUrl = "http://localhost:3000/api/users";
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
    return data; // Return the entire data object
  } catch (error) {
    throw error; // Rethrow the error to be handled in the Yup validation
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
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};
