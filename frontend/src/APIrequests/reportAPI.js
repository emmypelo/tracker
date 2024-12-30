import axios from "axios";

const baseUrl = "http://localhost:3000/api/reports";
// ? create Task API
export const createReportApi = async (reportData) => {
  const { data } = await axios.post(`${baseUrl}/create`, reportData, {
    withCredentials: true,
  });
  return data;
};

export const fetchReportsApi = async (filters) => {
  const { data } = await axios.get(`${baseUrl}`, { params: filters });
  console.log(data);
  return data;
};

export const reportDetailsApi = async (reportId) => {
  const { data } = await axios.get(`${baseUrl}/${reportId}`);
  return data;
};

export const updateReportApi = async (updateData) => {
  const { data } = await axios.patch(
    `${baseUrl}/${updateData?.reportId}`,
    updateData,
    {
      withCredentials: true,
    }
  );
  console.log(data);
  return data;
};

export const deleteReportApi = async (reportId) => {
  const { data } = await axios.delete(`${baseUrl}/${reportId}`, {
    withCredentials: true,
  });
  console.log(data);
  return data;
};
