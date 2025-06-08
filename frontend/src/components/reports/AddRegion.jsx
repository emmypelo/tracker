import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchRegionsApi, addRegionApi } from "../../APIrequests/regionAPI";
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
  const mutation = useMutation({
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
      await mutation.mutateAsync(values);
    },
  });

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
    <div className="animate-pulse space-y-4 p-4 sm:p-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded-full w-16 flex-shrink-0 ml-4"></div>
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
      <div className="p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No regions yet
            </h3>
            <p className="text-gray-500 mb-6 text-center">
              Get started by creating your first region.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
        ) : (
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="group bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  to={`/manage/regions/${item._id}`}
                  className="block p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center mb-2 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
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
                        <h3 className="md:text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 ">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex align-middle self-center  justify-center space-x-1 flex-shrink-0 ml-2  ">
                      <div className="flex items-center bg-gray-50 px-2 sm:px-2 py-1.5 rounded-full">
                        <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                          {item.stations?.length || 0} Stations
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render add form
  const renderAddForm = () => (
    <form className="p-4 sm:p-6 space-y-6" onSubmit={formik.handleSubmit}>
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Region Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          {...formik.getFieldProps("title")}
          placeholder="Enter region title"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
            formik.errors.title && formik.touched.title
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white"
          }`}
        />
        {renderError("title")}
      </div>

      <div>
        <label
          htmlFor="rss"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          RSS
        </label>
        <input
          type="text"
          name="rss"
          id="rss"
          {...formik.getFieldProps("rss")}
          placeholder="Enter RSS name"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
            formik.errors.rss && formik.touched.rss
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white"
          }`}
        />
        {renderError("rss")}
      </div>

      <div>
        <label
          htmlFor="supervisor"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Supervisor
        </label>
        <input
          type="text"
          name="supervisor"
          id="supervisor"
          {...formik.getFieldProps("supervisor")}
          placeholder="Enter supervisor name"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
            formik.errors.supervisor && formik.touched.supervisor
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white"
          }`}
        />
        {renderError("supervisor")}
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false);
            formik.resetForm();
          }}
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
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
              Adding...
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
              Add Region
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Manage Regions
                </h1>
                <p className="text-indigo-100 text-sm mt-1">
                  Total: {regions.length} regions
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm"
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
                  <span className="hidden sm:inline">Add Region</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {regionsError ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-500 mb-6 text-center">
                Error loading regions. Please try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
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

        {/* Add Region Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            formik.resetForm();
          }}
          title="Add New Region"
          buttonText="Close"
        >
          {mutation.isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
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
                <span className="text-indigo-600 font-medium">
                  Adding region...
                </span>
              </div>
            </div>
          ) : (
            renderAddForm()
          )}
        </Modal>

        {/* Success/Error Modal */}
        <Modal
          isOpen={mutation.isError || (!mutation.isLoading && !!modalMessage)}
          onClose={() => {
            setModalMessage("");
            setIsError(false);
          }}
          title={isError ? "Error" : "Success"}
          buttonText="Close"
        >
          <div className="text-center py-4">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isError ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isError ? (
                <svg
                  className="w-8 h-8 text-red-500"
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
                  className="w-8 h-8 text-green-500"
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
              className={`text-lg font-medium ${
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
