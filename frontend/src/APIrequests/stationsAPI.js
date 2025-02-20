import axios from "axios";

const baseUrl = "http://localhost:3000/api/stations";
// ? Station
export const addStationApi = async (stationData) => {
  const { data } = await axios.post(`${baseUrl}/create`, stationData, {
    withCredentials: true,
  });
  return data;
};

export const fetchStationsApi = async (filters) => {
  // This removes empty values from the filters object
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([value]) => value !== "")
  );

  const { data } = await axios.get(`${baseUrl}`, {
    params: cleanFilters,
  });

  return data;
};

export const fetchAstation = async (stationId) => {
  const { data } = await axios.get(`${baseUrl}/${stationId}`);
  return data;
};

export const updateStationApi = async (updateData) => {
  const { data } = await axios.put(
    `${baseUrl}/${updateData?.stationId}`,
    updateData,
    {
      withCredentials: true,
    }
  );

  return data;
};

export const deleteStationApi = async (stationId) => {
  const { data } = await axios.delete(`${baseUrl}/${stationId}`, {
    withCredentials: true,
  });

  return data;
};
