import axios from "axios";

const baseUrl = "http://localhost:3000/api/tasks";
// ? create Task API
export const createTaskApi = async (postData) => {
  const { data } = await axios.post(`${baseUrl}/create`, postData, {
    withCredentials: true,
  });
  return data;
};

export const fetchTasksApi = async (filters) => {
  const { data } = await axios.get(`${baseUrl}`, { params: filters });
  console.log(data);
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
  console.log(data);
  return data;
};

export const deletePostApi = async (taskId) => {
  const { data } = await axios.delete(`${baseUrl}/${taskId}`, {
    withCredentials: true,
  });
  console.log(data);
  return data;
};
