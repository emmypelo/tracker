import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchCategoriesApi } from "../../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../../APIrequests/subCategoryAPI";
import { createTaskApi } from "../../APIrequests/taskAPI";
import Modal from "../common/Modal";

const CreateTask = () => {
  const navigate = useNavigate();
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

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
        setIsError(false);
        setModalMessage("Task created successfully");
        setIsModalOpen(true);
      } catch (error) {
        setIsError(true);
        let errorMessage = "Task creation failed";

        if (error.response?.status === 401 || error.message.includes("401")) {
          errorMessage = "Login required";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        console.error("Error creating task:", error);
        setModalMessage(errorMessage);
        setIsModalOpen(true);
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

  const renderError = (field) =>
    formik.touched[field] &&
    formik.errors[field] && (
      <p className="mt-1 text-sm text-red-500 absolute top-0 right-4">
        {formik.errors[field]}
      </p>
    );

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError) {
      formik.resetForm();
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col w-full items-center mx-auto">
      <form
        onSubmit={formik.handleSubmit}
        className="relative w-full space-y-2 p-6"
      >
        <h2 className="text-2xl font-bold text-slate-800 text-center capitalize">
          Create New Task
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Title Input */}
          <div className="relative">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            {renderError("title")}
            <input
              id="title"
              type="text"
              placeholder="Enter post title"
              {...formik.getFieldProps("title")}
              className={`w-full p-2.5 border rounded-md ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>

          {/* Vendor Input */}
          <div className="relative">
            <label
              htmlFor="vendor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vendor
            </label>
            {renderError("vendor")}
            <input
              id="vendor"
              type="text"
              placeholder="Enter vendor name"
              {...formik.getFieldProps("vendor")}
              className={`w-full p-2.5 border rounded-md ${
                formik.touched.vendor && formik.errors.vendor
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>

          {/* Amount Input */}
          <div className="relative">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className={`w-full p-2.5 border rounded-md ${
                formik.touched.amount && formik.errors.amount
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>

          {/* Approver Select */}
          <div className="relative">
            <label
              htmlFor="approver"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Approver
            </label>
            {renderError("approver")}
            <Select
              id="approver"
              options={approvers}
              onChange={(option) =>
                formik.setFieldValue("approver", option.value)
              }
              className={`${
                formik.touched.approver && formik.errors.approver
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.approver && formik.errors.approver
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Category Select */}
          <div className="relative">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className={`${
                formik.touched.category && formik.errors.category
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.category && formik.errors.category
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Subcategory Select */}
          <div className="relative">
            <label
              htmlFor="subCategory"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subcategory
            </label>
            {renderError("subCategory")}
            <Select
              id="subCategory"
              placeholder="Select a Subcategory"
              options={subCategoriesData?.data?.subCategories.map(
                (subCategory) => ({
                  value: subCategory._id,
                  label: subCategory.title,
                })
              )}
              onChange={(option) =>
                formik.setFieldValue("subCategory", option.value)
              }
              className={`${
                formik.touched.subCategory && formik.errors.subCategory
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.subCategory && formik.errors.subCategory
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-1/3 px-5 py-3 mt-8 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Task..." : "Create Task"}
        </button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
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

export default CreateTask;
