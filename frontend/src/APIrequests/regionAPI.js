import axios from "axios";

const baseUrl = "http://localhost:3000/api/regions";
// ? create region API
export const addRegionApi = async (regionData) => {
  const { data } = await axios.post(`${baseUrl}/create`, regionData, {
    withCredentials: true,
  });
  return data;
};

export const fetchRegionsApi = async (filters) => {
  const { data } = await axios.get(`${baseUrl}`, { params: filters });

  return data;
};

export const regionDetailsApi = async (regionId) => {
  const { data } = await axios.get(`${baseUrl}/${regionId}`);
  return data;
};

export const updateRegionApi = async (updateData) => {
  const { data } = await axios.patch(
    `${baseUrl}/${updateData?.regionId}`,
    updateData,
    {
      withCredentials: true,
    }
  );

  return data;
};

export const deleteRegionApi = async (regionId) => {
  const { data } = await axios.delete(`${baseUrl}/${regionId}`, {
    withCredentials: true,
  });

  return data;
};
