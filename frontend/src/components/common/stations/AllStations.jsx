"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStationApi,
  fetchStationsApi,
  updateStationApi,
} from "../../../APIrequests/stationsAPI";
import { fetchRegionsApi } from "../../../APIrequests/regionAPI";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../../common/Modal";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";

const AllStations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [isError, setIsError] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);

  const [filters, setFilters] = useState({
    name: "",
    region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedFetchStations = useCallback(
    debounce((newFilters) => {
      queryClient.invalidateQueries(["fetchStations", newFilters]);
    }, 300),
    []
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFetchStations(newFilters);
  };

  const {
    isError: isStationsError,
    data: stationsData,
    error: stationsError,
    refetch: stationRefetch,
  } = useQuery({
    queryKey: ["fetchStations", filters],
    queryFn: () => fetchStationsApi(filters),
    keepPreviousData: true,
  });

  const { data: regionsData } = useQuery({
    queryKey: ["fetchRegions"],
    queryFn: fetchRegionsApi,
  });

  const stationMutation = useMutation({
    mutationKey: ["updateStation"],
    mutationFn: updateStationApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetchStations", filters]);
    },
  });

  const handleDelete = async (stationId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setStationToDelete(stationId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationToDelete) return;

    try {
      await deleteMutation.mutateAsync(stationToDelete);
      setIsError(false);
      setModalMessage("Station deleted successfully");
    } catch (error) {
      setIsError(true);
      let errorMessage = "Deleting failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setModalMessage(errorMessage);
    } finally {
      setIsModalOpen(false);
      setStationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setStationToDelete(null);
  };

  const deleteMutation = useMutation({
    mutationKey: ["deleteStation"],
    mutationFn: deleteStationApi,
    onSuccess: () => {
      setIsError(false);
      setModalMessage("Station deleted successfully");
      setIsModalOpen(true);
      stationRefetch();
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Deleting failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const [editValues, setEditValues] = useState({
    name: "",
    managerName: "",
    managerPhone: "",
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (station) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setEditingRowId(station._id);
    setEditValues({
      name: station.name,
      managerName: station.managerName,
      managerPhone: station.managerPhone,
    });
  };

  const saveChanges = async () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    const updateData = {
      ...editValues,
      stationId: editingRowId,
    };

    try {
      await stationMutation.mutateAsync(updateData);

      setIsError(false);
      setModalMessage("Station updated successfully");
      setIsModalOpen(true);
    } catch (error) {
      setIsError(true);
      let errorMessage = "Station update failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    } finally {
      setEditingRowId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError) {
      navigate("/");
    }
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({
      name: "",
      managerName: "",
      managerPhone: "",
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("name", searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm("");
    const clearedFilters = {
      name: "",
      region: "",
      managerName: "",
      managerPhone: "",
    };
    setFilters(clearedFilters);
    debouncedFetchStations(clearedFilters);
  };

  if (isStationsError)
    return <h2>Error: {stationsError?.message || "Something went wrong"}</h2>;

  const stations = stationsData?.data?.stations || [];
  const regions = regionsData?.data?.regions || [];

  return (
    <div className="relative px-1">
      <div className="sticky top-[4.6rem] left-0 right-0 bg-white shadow-md z-30">
        <div className="flex justify-between items-center w-full h-16 px-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Stations Dashboard</h1>
          <Link
            to="/newstation"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            New Station
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb py-6 px-4 sticky top-[4rem] z-20 bg-gray-100 h-[5rem]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 ">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border p-2 rounded flex justify-between w-1/2 md:w-1/4"
          />
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="border p-2 rounded "
          >
            <option value="">All Regions</option>
            {regions?.map((region) => (
              <option key={region._id} value={region._id}>
                {region.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </form>
      </div>

      {stations.length === 0 ? (
        <div>No stations found</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="sticky top-[12.6rem] bg-gray-200 text-sm">
                <th className="border p-1 w-[5%]">S/N</th>
                <th className="border p-1 w-[25%]">Name</th>
                <th className="border p-1 w-[19%]">Region</th>
                <th className="border p-1 w-[26%]">Manager Name</th>
                <th className="border p-1 w-[20%]">Manager Phone</th>
                <th className="border p-1 w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station, index) => (
                <tr
                  key={station._id}
                  className={`hover:bg-gray-100 text-sm md:text-base h-12 ${
                    editingRowId === station._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="border px-1 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">
                    {editingRowId === station._id ? (
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) =>
                          handleEditChange("name", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      />
                    ) : (
                      station.name
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {station.region?.title || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === station._id ? (
                      <input
                        type="text"
                        value={editValues.managerName}
                        onChange={(e) =>
                          handleEditChange("managerName", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      />
                    ) : (
                      station.managerName
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === station._id ? (
                      <input
                        type="text"
                        value={editValues.managerPhone}
                        onChange={(e) =>
                          handleEditChange("managerPhone", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      />
                    ) : (
                      station.managerPhone
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === station._id ? (
                      <div className="flex justify-between items-center h-8 ">
                        <button
                          onClick={saveChanges}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1"
                        >
                          <IoCheckmarkDoneSharp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdOutlineCancel className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center h-8 gap-2">
                        <button
                          onClick={() => startEditing(station)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        >
                          <FiEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(station._id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdDelete className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
        isDeleteAction={!!stationToDelete}
        onDelete={confirmDelete}
        onCancel={cancelDelete}
        deleteConfirmationText="Are you sure you want to delete this station? This action cannot be undone."
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default AllStations;
