import axios from "axios";

const baseUrl = "http://localhost:3000/api/reportcategory";
// ? Category
export const addReportCategoryApi = async (categoryData) => {
  const { data } = await axios.post(`${baseUrl}/create`, categoryData, {
    withCredentials: true,
  });
  return data;
};

export const fetchReportCategoriesApi = async () => {
  const { data } = await axios.get(
    `${baseUrl}`
    // { withCredentials: true }
  );
  console.log(data);
  return data;
};

export const fetchReportCategory = async (categoryId) => {
  const { data } = await axios.get(`${baseUrl}/${categoryId}`);
  return data;
};

export const updateReportCategoryApi = async (updateData) => {
  const { data } = await axios.put(
    `${baseUrl}/${updateData?.categoryId}`,
    updateData,
    {
      withCredentials: true,
    }
  );
  console.log(data);
  return data;
};

export const deleteReportCategoryApi = async (categoryId) => {
  const { data } = await axios.delete(`${baseUrl}/${categoryId}`, {
    withCredentials: true,
  });
  console.log(data);
  return data;
};
