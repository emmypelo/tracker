"use client";

import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchRegionsApi } from "../../../APIrequests/regionAPI";
import {
  addStationApi,
  deleteStationApi,
  fetchStationsApi,
  updateStationApi,
} from "../../../APIrequests/stationsAPI";
import Modal from "../../common/Modal";
import { useSelector } from "react-redux";
import { FiEdit, FiPlus } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { Search, X } from "lucide-react";
import debounce from "lodash/debounce";


const StationManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState("list");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);

  // Edit states
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: "",
    managerName: "",
    managerPhone: "",
  });

  // Filter states
  const [filters, setFilters] = useState({
    name: "",
    region: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced search
  const debouncedFetchStations = useCallback(
    debounce((newFilters) => {
      queryClient.invalidateQueries(["fetchStations", newFilters]);
    }, 300),
    []
  );

  // Queries
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegionsApi,
  });

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

  // Mutations
  const addStationMutation = useMutation({
    mutationKey: ["add-station"],
    mutationFn: (values) => addStationApi(values),
    onSuccess: () => {
      setModalMessage("Station added successfully.");
      setIsError(false);
      setIsModalOpen(true);
      queryClient.invalidateQueries(["fetchStations"]);
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "An error occurred.");
      setIsError(true);
      setIsModalOpen(true);
    },
  });

  const updateStationMutation = useMutation({
    mutationKey: ["updateStation"],
    mutationFn: updateStationApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetchStations", filters]);
      setModalMessage("Station updated successfully");
      setIsError(false);
      setIsModalOpen(true);
    },
    onError: (error) => {
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
    },
  });

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

  // Form handling
  const formik = useFormik({
    initialValues: {
      name: "",
      region: "",
      managerName: "",
      managerPhone: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Station name is required"),
      region: Yup.string().required("Region is required"),
      managerName: Yup.string().required("Manager name is required"),
      managerPhone: Yup.string().required("Manager phone is required"),
    }),
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: location } });
        return;
      }
      await addStationMutation.mutateAsync(values);
    },
  });

  // Helper functions
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <p className="mt-1 text-sm text-red-500 absolute top-0 right-4">
        {formik.errors[field]}
      </p>
    );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFetchStations(newFilters);
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

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
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
    await updateStationMutation.mutateAsync(updateData);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({
      name: "",
      managerName: "",
      managerPhone: "",
    });
  };

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
    await deleteMutation.mutateAsync(stationToDelete);
    setStationToDelete(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setStationToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError && activeTab === "add") {
      formik.resetForm();
      setActiveTab("list");
    }
  };

  const stations = stationsData?.data?.stations || [];
  const regionsOptions = regions?.data?.regions || [];

  if (isStationsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-xl text-red-600">
          Error: {stationsError?.message || "Something went wrong"}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Station Management
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Stations ({stations.length})
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === "add"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              Add Station
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "list" ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-4"
              >
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by station name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  className="h-10 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {regionsOptions?.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.title}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-10 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </form>
            </div>

            {/* Stations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {stations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No stations found</p>
                  <button
                    onClick={() => setActiveTab("add")}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Station
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Station Name
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Region
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Manager
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stations.map((station, index) => (
                        <tr
                          key={station._id}
                          className={`hover:bg-gray-50 ${
                            editingRowId === station._id ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingRowId === station._id ? (
                              <input
                                type="text"
                                value={editValues.name}
                                onChange={(e) =>
                                  handleEditChange("name", e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900">
                                {station.name}
                              </div>
                            )}
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {station.region?.title || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingRowId === station._id ? (
                              <input
                                type="text"
                                value={editValues.managerName}
                                onChange={(e) =>
                                  handleEditChange(
                                    "managerName",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {station.managerName}
                              </div>
                            )}
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                            {editingRowId === station._id ? (
                              <input
                                type="text"
                                value={editValues.managerPhone}
                                onChange={(e) =>
                                  handleEditChange(
                                    "managerPhone",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {station.managerPhone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {editingRowId === station._id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={saveChanges}
                                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                                >
                                  <IoCheckmarkDoneSharp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors"
                                >
                                  <MdOutlineCancel className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditing(station)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(station._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                                >
                                  <MdDelete className="w-4 h-4" />
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
            </div>
          </div>
        ) : (
          /* Add Station Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Station
              </h2>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  >
                    Station Name
                  </label>
                  {renderError("name")}
                  <input
                    type="text"
                    name="name"
                    id="name"
                    {...formik.getFieldProps("name")}
                    placeholder="Enter station name"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.errors.name && formik.touched.name
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  >
                    Region
                  </label>
                  {renderError("region")}
                  <select
                    name="region"
                    id="region"
                    {...formik.getFieldProps("region")}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.errors.region && formik.touched.region
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a region</option>
                    {regionsOptions?.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label
                    htmlFor="managerName"
                    className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  >
                    Manager Name
                  </label>
                  {renderError("managerName")}
                  <input
                    type="text"
                    name="managerName"
                    id="managerName"
                    {...formik.getFieldProps("managerName")}
                    placeholder="Enter manager name"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.errors.managerName && formik.touched.managerName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="managerPhone"
                    className="block text-sm font-medium text-gray-700 mb-2 text-left"
                  >
                    Manager Phone
                  </label>
                  {renderError("managerPhone")}
                  <input
                    type="tel"
                    name="managerPhone"
                    id="managerPhone"
                    {...formik.getFieldProps("managerPhone")}
                    placeholder="Enter manager phone"
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.errors.managerPhone && formik.touched.managerPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formik.isSubmitting ? "Adding..." : "Add Station"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
        isDeleteAction={!!stationToDelete}
        onDelete={confirmDelete}
        onCancel={cancelDelete}
        deleteConfirmationText="Are you sure you want to delete this station? This action cannot be undone."
      >
        <p
          className={`text-center ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {modalMessage}
        </p>
      </Modal>
    </div>
  );
};

export default StationManagement;
