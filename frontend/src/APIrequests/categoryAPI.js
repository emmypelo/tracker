import axios from "axios";

const baseUrl = "http://localhost:3000/api/category";
// ? Category
export const addCategoryApi = async (categoryData) => {
  const { data } = await axios.post(`${baseUrl}/create`, categoryData, {
    withCredentials: true,
  });
  return data;
};

export const fetchCategoriesApi = async () => {
  const { data } = await axios.get(
    `${baseUrl}`
    // { withCredentials: true }
  );

  return data;
};

export const fetchAcategory = async (categoryId) => {
  const { data } = await axios.get(`${baseUrl}/${categoryId}`);
  return data;
};

export const updateCategoryApi = async (updateData) => {
  const { data } = await axios.put(
    `${baseUrl}/${updateData?.categoryId}`,
    updateData,
    {
      withCredentials: true,
    }
  );

  return data;
};

// export const deletePostApi = async (categoryId) => {
//   const { data } = await axios.delete(`${baseUrl}/${categoryId}`, {
//     withCredentials: true,
//   });
//
//   return data;
// };
