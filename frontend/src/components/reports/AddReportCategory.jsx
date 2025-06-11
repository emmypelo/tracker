
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { useFormik } from "formik"
import * as Yup from "yup"
import { fetchReportCategoriesApi, addReportCategoryApi } from "../../APIrequests/reportCategoryAPI"
import Modal from "../common/Modal"

const AddReportCategory = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { userAuth } = useSelector((state) => state.auth)
  const isAuthenticated = userAuth?.data?.isAuthenticated === true

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [isError, setIsError] = useState(false)

  // Fetch report categories
  const {
    data: reportCategoriesData,
    error: reportCategoriesError,
    isLoading: reportCategoriesLoading,
  } = useQuery({
    queryKey: ["reportCategories"],
    queryFn: fetchReportCategoriesApi,
  })

  const reportCategories = reportCategoriesData?.data?.categories || []

  // Mutation for adding report category
  const mutation = useMutation({
    mutationKey: ["add-report-category"],
    mutationFn: (values) => addReportCategoryApi(values),
    onSuccess: () => {
      queryClient.invalidateQueries(["reportCategories"])
      setModalMessage("Report category added successfully.")
      setIsError(false)
      setIsAddModalOpen(false)
      formik.resetForm()
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "An error occurred.")
      setIsError(true)
    },
  })

  // Formik setup for adding report category
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Report category title is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: location } })
        return
      }
      await mutation.mutateAsync(values)
    },
  })

  // Render error for form fields
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <div className="mt-1 flex items-center text-red-500 text-xs">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {formik.errors[field]}
      </div>
    )

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-2 bg-gray-100 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded-full w-12"></div>
        </div>
      ))}
    </div>
  )

  // Render list of report categories - more compact version
  const renderReportCategoriesList = (items, isLoading) => {
    if (isLoading) {
      return <LoadingSkeleton />
    }

    return (
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No report categories yet</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by creating your first report category.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-100 rounded-lg hover:border-indigo-200 hover:shadow-sm transition-all duration-200"
                onClick={() => navigate(`/manage/report-categories/${item._id}`)}
              >
                <div className="p-3 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                      {item.description && <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-50 px-2 py-1 rounded-md">
                      <span className="text-xs font-medium text-gray-600">{item.reports?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render add form - more compact version
  const renderAddForm = () => (
    <form className="p-4 space-y-4" onSubmit={formik.handleSubmit}>
      <div>
        <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">
          Report Category Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          {...formik.getFieldProps("title")}
          placeholder="Enter report category title"
          className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
            formik.errors.title && formik.touched.title ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
          }`}
        />
        {renderError("title")}
      </div>

      <div>
        <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows={2}
          {...formik.getFieldProps("description")}
          placeholder="Enter report category description"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
        />
        {renderError("description")}
      </div>

      <div className="flex space-x-2 pt-2">
        <button
          type="button"
          onClick={() => {
            setIsAddModalOpen(false)
            formik.resetForm()
          }}
          className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex-1 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
        >
          {formik.isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </>
          ) : (
            <>Add Category</>
          )}
        </button>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header - more compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-bold text-white">Report Categories</h1>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-indigo-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Content - more compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {reportCategoriesError ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Something went wrong</h3>
              <p className="text-xs text-gray-500 mb-4">Error loading report categories.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            renderReportCategoriesList(reportCategories, reportCategoriesLoading)
          )}
        </div>

        {/* Add Report Category Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            formik.resetForm()
          }}
          title="Add New Category"
          buttonText="Close"
        >
          {mutation.isLoading ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-indigo-600 text-sm font-medium">Adding category...</span>
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
            setModalMessage("")
            setIsError(false)
          }}
          title={isError ? "Error" : "Success"}
          buttonText="Close"
        >
          <div className="text-center py-3">
            <div
              className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                isError ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {isError ? (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <p className={`text-sm font-medium ${isError ? "text-red-600" : "text-green-600"}`}>{modalMessage}</p>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default AddReportCategory
