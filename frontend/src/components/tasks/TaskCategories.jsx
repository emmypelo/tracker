import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchCategoriesApi,
  addCategoryApi,
} from "../../APIrequests/categoryAPI";
import {
  fetchSubCategoriesApi,
  addSubCategoryApi,
} from "../../APIrequests/subCategoryAPI";
import Modal from "../common/Modal";

const TaskCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [activeView, setActiveView] = useState("categories");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Fetch categories and subcategories
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const {
    data: subCategoriesData,
    error: subCategoriesError,
    isLoading: subCategoriesLoading,
  } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  const categories = categoriesData?.data?.categories || [];
  const subCategories = subCategoriesData?.data?.subCategories || [];

  // Mutation for adding category/subcategory
  const mutation = useMutation({
    mutationKey: ["add-item"],
    mutationFn: (values) =>
      activeView === "categories"
        ? addCategoryApi(values)
        : addSubCategoryApi(values),
    onSuccess: () => {
      queryClient.invalidateQueries(["fetchCategory", "fetchSubCategories"]);
      setModalMessage(
        `${
          activeView === "categories" ? "Category" : "Subcategory"
        } added successfully.`
      );
      setIsError(false);
      setIsAddModalOpen(false);
      formik.resetForm();
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "An error occurred.");
      setIsError(true);
    },
  });

  // Formik setup for adding category/subcategory
  const formik = useFormik({
    initialValues: {
      [activeView === "categories" ? "category" : "title"]: "",
      description: "",
    },
    validationSchema: Yup.object({
      [activeView === "categories" ? "category" : "title"]:
        Yup.string().required(
          `${
            activeView === "categories" ? "Category" : "Subcategory"
          } name is required`
        ),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: location } });
        return;
      }
      await mutation.mutateAsync(values);
    },
    enableReinitialize: true,
  });

  // Toggle between categories and subcategories
  const toggleView = (view) => {
    setActiveView(view);
    formik.resetForm();
  };

  // Render error for form fields
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <div className="mt-2 flex items-center text-red-500 text-sm">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {formik.errors[field]}
      </div>
    );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
        >
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
        </div>
      ))}
    </div>
  );

  // Render list of categories or subcategories
  const renderList = (items, isLoading) => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    return (
      <div className="p-6">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeView === "categories" ? "categories" : "subcategories"}{" "}
              yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first{" "}
              {activeView === "categories" ? "category" : "subcategory"}.
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
              Add {activeView === "categories" ? "Category" : "Subcategory"}
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item, index) => (
              <div
                key={item._id}
                className="group bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  to={`/manage/${activeView}/${item._id}`}
                  className="block p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1 pr-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 truncate">
                          {activeView === "categories"
                            ? item.category
                            : item.title}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 overflow-hidden">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded-full">
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {item.tasks?.length || 0}
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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
    <form className="p-6 space-y-6" onSubmit={formik.handleSubmit}>
      <div>
        <label
          htmlFor={activeView === "categories" ? "category" : "title"}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {activeView === "categories" ? "Category" : "Subcategory"} Name
        </label>
        <input
          type="text"
          name={activeView === "categories" ? "category" : "title"}
          id={activeView === "categories" ? "category" : "title"}
          {...formik.getFieldProps(
            activeView === "categories" ? "category" : "title"
          )}
          placeholder={`Enter ${
            activeView === "categories" ? "category" : "subcategory"
          } name`}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
            formik.errors[activeView === "categories" ? "category" : "title"] &&
            formik.touched[activeView === "categories" ? "category" : "title"]
              ? "border-red-300 bg-red-50"
              : "border-gray-300 bg-white"
          }`}
        />
        {renderError(activeView === "categories" ? "category" : "title")}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          {...formik.getFieldProps("description")}
          placeholder={`Enter ${
            activeView === "categories" ? "category" : "subcategory"
          } description`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
        />
      </div>

      <div className="flex space-x-3 pt-4">
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
              Add {activeView === "categories" ? "Category" : "Subcategory"}
            </>
          )}
        </button>
      </div>
    </form>
  );

  const isLoading = categoriesLoading || subCategoriesLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1 truncate">
                  Task Management
                </h1>
                <p className="text-indigo-100 text-sm capitalize">
                  Manage your{" "}
                  {activeView === "categories" ? "categories" : "subcategories"}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex">
                  <button
                    onClick={() => toggleView("categories")}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                      activeView === "categories"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => toggleView("subcategories")}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex-1 ${
                      activeView === "subcategories"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Subcategories
                  </button>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-white text-indigo-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm justify-center whitespace-nowrap"
                >
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
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
                  <span>New</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {categoriesError || subCategoriesError ? (
            <div className="text-center py-12">
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
              <p className="text-gray-500 mb-6">
                Error loading data. Please try again later.
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
            renderList(
              activeView === "categories" ? categories : subCategories,
              isLoading
            )
          )}
        </div>

        {/* Modals */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            formik.resetForm();
          }}
          title={`Add New ${
            activeView === "categories" ? "Category" : "Subcategory"
          }`}
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
                  Adding{" "}
                  {activeView === "categories" ? "category" : "subcategory"}...
                </span>
              </div>
            </div>
          ) : (
            renderAddForm()
          )}
        </Modal>

        <Modal
          isOpen={mutation.isError || (!mutation.isLoading && !!modalMessage)}
          onClose={() => {
            setModalMessage("");
            setIsError(false);
            if (!isError) navigate("/manage");
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

export default TaskCategories;
