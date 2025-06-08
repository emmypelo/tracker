import { useMemo } from "react";
import { useState } from "react";
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
import { FiEdit, FiPlus, FiMapPin } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { Search, X, Phone, User } from "lucide-react";
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
  const [editingStationId, setEditingStationId] = useState(null);
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

  // ...other imports

  // Debounced search
  const debouncedFetchStations = useMemo(
    () =>
      debounce((newFilters) => {
        queryClient.invalidateQueries(["fetchStations", newFilters]);
      }, 300),
    [queryClient]
  );

  // Queries
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegionsApi,
  });

  const {
    isError: isStationsError,
    data: stationsData,
    isLoading: isStationsLoading,
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
      setEditingStationId(null);
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
      <p className="mt-1 text-sm text-red-500">{formik.errors[field]}</p>
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
    };
    setFilters(clearedFilters);
    debouncedFetchStations(clearedFilters);
  };

  const startEditing = (station) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setEditingStationId(station._id);
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
      stationId: editingStationId,
    };
    await updateStationMutation.mutateAsync(updateData);
  };

  const cancelEditing = () => {
    setEditingStationId(null);
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

  const LoadingSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 animate-pulse"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isStationsError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h2 className="text-xl text-red-600">
          Error: {stationsError?.message || "Something went wrong"}
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              Station Management
            </h1>
            <div className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-medium text-blue-600">
                {stations.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="flex-shrink-0 bg-white border-b">
        <div className="px-4">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Stations ({stations.length})
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
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

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        {activeTab === "list" ? (
          <div className="p-4 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder="Search by station name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>

                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  className="h-10 border border-gray-300 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
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
                    className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-10 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Clear</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Stations Grid */}
            {isStationsLoading ? (
              <LoadingSkeleton />
            ) : stations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiMapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No stations found
                </h3>
                <p className="text-sm mb-4 text-center">
                  Try adjusting your search criteria
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Station
                </button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stations.map((station) => (
                  <div
                    key={station._id}
                    className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                      editingStationId === station._id
                        ? "ring-2 ring-blue-500 border-blue-200"
                        : "border-gray-200"
                    }`}
                  >
                    {editingStationId === station._id ? (
                      // Edit Mode
                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Station Name
                            </label>
                            <input
                              type="text"
                              value={editValues.name}
                              onChange={(e) =>
                                handleEditChange("name", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Manager Name
                            </label>
                            <input
                              type="text"
                              value={editValues.managerName}
                              onChange={(e) =>
                                handleEditChange("managerName", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Manager Phone
                            </label>
                            <input
                              type="text"
                              value={editValues.managerPhone}
                              onChange={(e) =>
                                handleEditChange("managerPhone", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={saveChanges}
                              disabled={updateStationMutation.isLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <IoCheckmarkDoneSharp className="w-4 h-4" />
                              <span className="text-sm">Save</span>
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                              <MdOutlineCancel className="w-4 h-4" />
                              <span className="text-sm">Cancel</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {station.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {station.name}
                              </h3>
                            </div>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 ml-2 flex-shrink-0">
                            {station.region?.title || "No Region"}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="font-medium">Manager:</span>
                            <span className="ml-1 truncate">
                              {station.managerName}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="font-medium">Phone:</span>
                            <span className="ml-1 truncate">
                              {station.managerPhone}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end items-center">
                          <div className="flex gap-8 flex-shrink-0">
                            <button
                              onClick={() => startEditing(station)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                              title="Edit station"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(station._id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                              title="Delete station"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Add Station Form */
          <div className="p-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Station
              </h2>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Station Name
                  </label>
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
                  {renderError("name")}
                </div>

                <div>
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Region
                  </label>
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
                  {renderError("region")}
                </div>

                <div>
                  <label
                    htmlFor="managerName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Manager Name
                  </label>
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
                  {renderError("managerName")}
                </div>

                <div>
                  <label
                    htmlFor="managerPhone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Manager Phone
                  </label>
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
                  {renderError("managerPhone")}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
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
