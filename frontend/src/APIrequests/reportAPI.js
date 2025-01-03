import axios from "axios";

const baseUrl = "http://localhost:3000/api/reports";
// ? create Task API
export const createReportApi = async (values) => {
  const { data } = await axios.post(`${baseUrl}/create`, values, {
    withCredentials: true,
  });
  return data;
};

export const fetchReportsApi = async (filters) => {
  // Remove empty filter values to prevent unnecessary query params
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([value]) => value !== "")
  );

  const { data } = await axios.get(`${baseUrl}`, {
    params: cleanFilters,
  });

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

  return data;
};

export const deleteReportApi = async (reportId) => {
  const { data } = await axios.delete(`${baseUrl}/${reportId}`, {
    withCredentials: true,
  });

  return data;
};
