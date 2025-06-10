import axios from "axios";

import { backendURL } from "../utils/backendURL.js";

const baseUrl = `${backendURL}/tasks`;
// ? create Task API
export const createTaskApi = async (postData) => {
  const { data } = await axios.post(`${baseUrl}/create`, postData, {
    withCredentials: true,
  });
  return data;
};

export const fetchTasksApi = async (filters) => {
  const { data } = await axios.get(`${baseUrl}`, { params: filters });

  return data;
};

export const taskDetailsApi = async (taskId) => {
  const { data } = await axios.get(`${baseUrl}/${taskId}`);
  return data;
};

export const updateTaskApi = async (updateData) => {
  const { data } = await axios.patch(
    `${baseUrl}/${updateData?.taskId}`,
    updateData,
    {
      withCredentials: true,
    }
  );

  return data;
};

export const deleteTaskApi = async (taskId) => {
  const { data } = await axios.delete(`${baseUrl}/${taskId}`, {
    withCredentials: true,
  });

  return data;
};
