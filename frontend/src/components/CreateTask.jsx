import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";
import { createTaskApi } from "../APIrequests/taskAPI";

const CreateTask = () => {
  const approvers = [
    { value: "TES", label: "TES" },
    { value: "AAB", label: "AAB" },
    { value: "VAS", label: "VAS" },
    { value: "TAA", label: "TAA" },
    { value: "IOS", label: "IOS" },
  ];
  const taskMutation = useMutation({
    mutationKey: ["createTask"],
    mutationFn: createTaskApi,
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      vendor: "",
      amount: "",
      approver: "",
      category: "",
      subCategory: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      vendor: Yup.string().required("Vendor is required"),
      amount: Yup.number().required("Amount is required"),
      approver: Yup.string().required("Approver is required"),
      category: Yup.string().required("Category is required"),
      subCategory: Yup.string().required("Subcategory is required"),
    }),
    onSubmit: async (values) => {
      try {
        await taskMutation.mutateAsync(values);
        console.log("Submitted values:", values);
      } catch (error) {
        console.error("Task creating failed:", error);
      }
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const { data: subCategoriesData } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  // Helper function for displaying form errors
  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <p className="mt-1 text-sm text-red-500 absolute top-0 right-4">
        {formik.errors[field]}
      </p>
    );

  return (
    <div className="flex flex-col w-full items-center mx-auto ">
      <form
        onSubmit={formik.handleSubmit}
        className="relative w-full space-y-2  p-6 "
      >
        <h2 className="text-2xl font-bold text-slate-800 text-center capitalize">
          Create New Task
        </h2>

        {/* Display submission status */}
        {taskMutation.isLoading && (
          <div className="text-center text-blue-600">Creating post...</div>
        )}
        {taskMutation.isError && (
          <div className="text-center text-red-500">
            {taskMutation.error?.response?.data?.error ||
              taskMutation.error?.message}
          </div>
        )}
        {taskMutation.isSuccess && (
          <div className="text-center text-green-600">
            Task created successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Title Input */}
          <div className="relative">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            {renderError("title")}
            <input
              id="title"
              type="text"
              placeholder="Enter post title"
              {...formik.getFieldProps("title")}
              className={`form-input p-2.5 ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : ""
              }`}
            />
          </div>

          {/* Vendor Input */}
          <div className="relative">
            <label htmlFor="vendor" className="form-label">
              Vendor
            </label>
            {renderError("vendor")}
            <input
              id="vendor"
              type="text"
              placeholder="Enter vendor name"
              {...formik.getFieldProps("vendor")}
              className={`form-input p-2.5 ${
                formik.touched.vendor && formik.errors.vendor
                  ? "border-red-500"
                  : ""
              }`}
            />
          </div>
          {/* Amount Input */}
          <div className="relative">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            {renderError("amount")}
            <input
              id="amount"
              type="number"
              placeholder="Enter amount"
              min="0.00"
              step="0.01"
              {...formik.getFieldProps("amount")}
              className={`form-input p-2.5 ${
                formik.touched.amount && formik.errors.amount
                  ? "border-red-500"
                  : ""
              }`}
            />
          </div>

          {/* Approver Select */}
          <div className="relative">
            <label htmlFor="approver" className="form-label">
              Approver
            </label>
            {renderError("approver")}
            <Select
              id="approver"
              options={approvers}
              onChange={(option) =>
                formik.setFieldValue("approver", option.value)
              }
              className={`form-input ${
                formik.touched.approver && formik.errors.approver
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  border: "0px",
                  textAlign: "left",
                }),
              }}
            />
          </div>

          {/* Category Select */}
          <div className="relative">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            {renderError("category")}
            <Select
              id="category"
              placeholder="Select a Category"
              options={categoriesData?.data?.categories?.map((category) => ({
                value: category._id,
                label: category.category,
              }))}
              onChange={(option) =>
                formik.setFieldValue("category", option.value)
              }
              className={`form-input ${
                formik.touched.category && formik.errors.category
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  border: "0px",
                  textAlign: "left",
                }),
              }}
            />
          </div>

          {/* Subcategory Select */}
          <div className="relative">
            <label htmlFor="subCategory" className="form-label">
              Subcategory
            </label>
            {renderError("subCategory")}
            <Select
              id="subCategory"
              placeholder="Select a Subcategory"
              options={subCategoriesData?.data?.subCategories?.map(
                (subCategory) => ({
                  value: subCategory._id,
                  label: subCategory.title,
                })
              )}
              onChange={(option) =>
                formik.setFieldValue("subCategory", option.value)
              }
              className={`form-input ${
                formik.touched.subCategory && formik.errors.subCategory
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  border: "0px",
                  textAlign: "left",
                }),
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{ marginTop: "4rem" }}
          className="w-1/3  px-5 py-3 text-base font-medium text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 "
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Task..." : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
