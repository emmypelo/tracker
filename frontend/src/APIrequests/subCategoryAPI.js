import axios from "axios";

const baseUrl = "http://localhost:3000/api/sub_category";
// ? Category
export const addSubCategoryApi = async (categoryData) => {
  const { data } = await axios.post(`${baseUrl}/create`, categoryData, {
    withCredentials: true,
  });
  return data;
};

export const fetchSubCategoriesApi = async () => {
  const { data } = await axios.get(`${baseUrl}`, { withCredentials: true });
  return data;
};

export const fetchSubCategory = async (subCategoryId) => {
  const { data } = await axios.get(`${baseUrl}/${subCategoryId}`);
  return data;
};

export const updateSubCategoryApi = async (updateData) => {
  const { data } = await axios.put(
    `${baseUrl}/${updateData?.subCategoryId}`,
    updateData,
    {
      withCredentials: true,
    }
  );

  return data;
};

export const deleteSubCategoryApi = async (subCategoryId) => {
  const { data } = await axios.delete(`${baseUrl}/${subCategoryId}`, {
    withCredentials: true,
  });

  return data;
};
