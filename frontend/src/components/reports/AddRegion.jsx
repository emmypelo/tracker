import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {  useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchRegionsApi,
  addRegionApi,
  updateRegionApi,
} from "../../APIrequests/regionAPI";
import Modal from "../common/Modal";

const AddRegion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [editingRss, setEditingRss] = useState(null);
  const [editRssValue, setEditRssValue] = useState("");
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [editSupervisorValue, setEditSupervisorValue] = useState("");

  // Fetch regions
  const {
    data: regionsData,
    error: regionsError,
    isLoading: regionsLoading,
  } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegionsApi,
  });

  const regions = regionsData?.data?.regions || [];

  // Mutation for adding region
  const addMutation = useMutation({
    mutationKey: ["add-region"],
    mutationFn: (values) => addRegionApi(values),
    onSuccess: () => {
      queryClient.invalidateQueries(["regions"]);
      setModalMessage("Region added successfully.");
      setIsError(false);
      setIsAddModalOpen(false);
      formik.resetForm();
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "An error occurred.");
      setIsError(true);
    },
  });

  // Mutation for updating RSS
  const updateRssMutation = useMutation({
    mutationKey: ["update-region-rss"],
    mutationFn: ({ regionId, rss }) => updateRegionApi({ regionId, rss }),
    onSuccess: () => {
      queryClient.invalidateQueries(["regions"]);
      setEditingRss(null);
      setEditRssValue("");
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "Failed to update RSS.");
      setIsError(true);
    },
  });

  // Mutation for updating Supervisor
  const updateSupervisorMutation = useMutation({
    mutationKey: ["update-region-supervisor"],
    mutationFn: ({ regionId, supervisor }) =>
      updateRegionApi({ regionId, supervisor }),
    onSuccess: () => {
      queryClient.invalidateQueries(["regions"]);
      setEditingSupervisor(null);
      setEditSupervisorValue("");
    },
    onError: (error) => {
      setModalMessage(
        error.response?.data?.message || "Failed to update supervisor."
      );
      setIsError(true);
    },
  });

  // Formik setup for adding region
  const formik = useFormik({
    initialValues: {
      title: "",
      rss: "",
      supervisor: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Region title is required"),
      rss: Yup.string(),
      supervisor: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: location } });
        return;
      }
      await addMutation.mutateAsync(values);
    },
  });

  // Handle RSS edit
  const handleEditRss = (regionId, currentRss) => {
    setEditingRss(regionId);
    setEditRssValue(currentRss || "");
  };

  const handleSaveRss = async (regionId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    await updateRssMutation.mutateAsync({ regionId, rss: editRssValue });
  };

  const handleCancelEdit = () => {
    setEditingRss(null);
    setEditRssValue("");
  };

  // Handle Supervisor edit
  const handleEditSupervisor = (regionId, currentSupervisor) => {
    setEditingSupervisor(regionId);
    setEditSupervisorValue(currentSupervisor || "");
  };

  const handleSaveSupervisor = async (regionId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    await updateSupervisorMutation.mutateAsync({
      regionId,
      supervisor: editSupervisorValue,
    });
  };

  const handleCancelSupervisorEdit = () => {
    setEditingSupervisor(null);
    setEditSupervisorValue("");
  };

  // Render error for form fields
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <div className="mt-2 flex items-center text-red-500 text-sm">
        <svg
          className="w-4 h-4 mr-1 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="truncate">{formik.errors[field]}</span>
      </div>
    );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl p-6 space-y-3">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-300 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render list of regions
  const renderRegionsList = (items, isLoading) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    return (
      <div className="p-6">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No regions yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first region to organize and manage
              your stations effectively.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Region
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="group bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                            {item.title}
                          </h3>
                       
                      </div>
                    </div>
                    <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full ml-3 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700 self-center">
                        {item.stations?.length || 0} Stations
                      </span>
                    </div>
                  </div>

                  {/* RSS Section with Edit Functionality */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-600">
                          RSS:
                        </span>
                        {editingRss === item._id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editRssValue}
                              onChange={(e) => setEditRssValue(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-1/2"
                              placeholder="Enter RSS name "
                              autoFocus
                            />
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleSaveRss(item._id)}
                                disabled={updateRssMutation.isLoading}
                                className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Save"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                title="Cancel"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <span className="text-sm text-gray-800 italic truncate">
                              {item.rss || "Not set"}
                            </span>
                            <button
                              onClick={() => handleEditRss(item._id, item.rss)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                              title="Edit RSS"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Section with Edit Functionality */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-600">
                          Supervisor:
                        </span>
                        {editingSupervisor === item._id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editSupervisorValue}
                              onChange={(e) =>
                                setEditSupervisorValue(e.target.value)
                              }
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-12"
                              placeholder="Enter supervisor name"
                              autoFocus
                            />
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleSaveSupervisor(item._id)}
                                disabled={updateSupervisorMutation.isLoading}
                                className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Save"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelSupervisorEdit}
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                title="Cancel"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <span className="text-sm text-gray-800 italic truncate">
                              {item.supervisor || "Not assigned"}
                            </span>
                            <button
                              onClick={() =>
                                handleEditSupervisor(item._id, item.supervisor)
                              }
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                              title="Edit Supervisor"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render add form
  const renderAddForm = () => (
    <form className="p-6 space-y-6" onSubmit={formik.handleSubmit}>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Region Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          {...formik.getFieldProps("title")}
          placeholder="Enter region title"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            formik.errors.title && formik.touched.title
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        />
        {renderError("title")}
      </div>

      <div>
        <label
          htmlFor="rss"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          RSS Name
        </label>
        <input
          type="text"
          name="rss"
          id="rss"
          {...formik.getFieldProps("rss")}
          placeholder="Enter RSS name"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            formik.errors.rss && formik.touched.rss
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        />
        {renderError("rss")}
      </div>

      <div>
        <label
          htmlFor="supervisor"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Supervisor
        </label>
        <input
          type="text"
          name="supervisor"
          id="supervisor"
          {...formik.getFieldProps("supervisor")}
          placeholder="Enter supervisor name"
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
            formik.errors.supervisor && formik.touched.supervisor
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white hover:border-gray-400"
          }`}
        />
        {renderError("supervisor")}
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            formik.resetForm();
          }}
          className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {formik.isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Region
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Smaller Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Regions Management
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {regions.length} regions •{" "}
                  {regions.reduce(
                    (total, region) => total + (region.stations?.length || 0),
                    0
                  )}{" "}
                  stations
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Region
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {regionsError ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't load your regions. Please check your connection and
                try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </button>
            </div>
          ) : (
            renderRegionsList(regions, regionsLoading)
          )}
        </div>

        {/* Enhanced Add Region Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            formik.resetForm();
          }}
          title="Create New Region"
          buttonText="Close"
        >
          {addMutation.isLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-blue-600 font-semibold text-lg">
                  Creating region...
                </span>
              </div>
            </div>
          ) : (
            renderAddForm()
          )}
        </Modal>

        {/* Enhanced Success/Error Modal */}
        <Modal
          isOpen={
            (addMutation.isError ||
              updateRssMutation.isError ||
              updateSupervisorMutation.isError ||
              (addMutation.isSuccess && !!modalMessage) ||
              (updateRssMutation.isSuccess && !!modalMessage) ||
              (updateSupervisorMutation.isSuccess && !!modalMessage)) &&
            !!modalMessage
          }
          onClose={() => {
            setModalMessage("");
            setIsError(false);
            addMutation.reset();
            updateRssMutation.reset();
            updateSupervisorMutation.reset();
          }}
          title={isError ? "Error" : "Success"}
          buttonText="Close"
        >
          <div className="text-center py-6">
            <div
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                isError ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isError ? (
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <p
              className={`text-lg font-semibold ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            >
              {modalMessage}
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AddRegion;
