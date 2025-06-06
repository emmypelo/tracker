import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchCategoriesApi } from "../../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../../APIrequests/subCategoryAPI";
import { createTaskApi } from "../../APIrequests/taskAPI";
import Modal from "../common/Modal";

// Common styles
const INPUT_CLASSES = "w-full rounded-md border p-2.5";
const ERROR_CLASSES = "border-red-500";
const NORMAL_CLASSES = "border-gray-300";
const LABEL_CLASSES = "mb-1 block text-sm font-medium text-gray-700 text-left";
const ERROR_MESSAGE_CLASSES =
  "absolute right-4 top-0 mt-1 text-sm text-red-500";
const BUTTON_CLASSES =
  "mt-8 w-1/3 rounded-lg bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const CreateTask = () => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  const approvers = [
    { value: "TES", label: "TES" },
    { value: "AAB", label: "AAB" },
    { value: "VAS", label: "VAS" },
    { value: "TAA", label: "TAA" },
    { value: "IOS", label: "IOS" },
  ];

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const { data: subCategoriesData } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  const taskMutation = useMutation({
    mutationKey: ["createTask"],
    mutationFn: createTaskApi,
    onSuccess: () => {
      setModalState({
        isOpen: true,
        message: "Task created successfully",
        isError: false,
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.status === 401 || error.message.includes("401")
          ? "Login required"
          : error.response?.data?.message || "Task creation failed";
      setModalState({
        isOpen: true,
        message: errorMessage,
        isError: true,
      });
    },
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
    onSubmit: (values) => taskMutation.mutate(values),
  });

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (!modalState.isError) {
      formik.resetForm();
      // navigate("/");
    }
  }, [modalState.isError, formik]);

  const renderError = useCallback(
    (field) =>
      formik.touched[field] &&
      formik.errors[field] && (
        <p className={ERROR_MESSAGE_CLASSES}>{formik.errors[field]}</p>
      ),
    [formik.touched, formik.errors]
  );

  const getSelectStyles = useCallback(
    (field) => ({
      control: (baseStyles) => ({
        ...baseStyles,
        borderColor:
          formik.touched[field] && formik.errors[field] ? "#ef4444" : "#d1d5db",
        boxShadow: "none",
      }),
    }),
    [formik.touched, formik.errors]
  );

  const renderInput = useCallback(
    ({ id, label, type = "text", placeholder, extraProps = {} }) => (
      <div className="relative">
        <label htmlFor={id} className={LABEL_CLASSES}>
          {label}
        </label>
        {renderError(id)}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...formik.getFieldProps(id)}
          {...extraProps}
          className={`${INPUT_CLASSES} ${
            formik.touched[id] && formik.errors[id]
              ? ERROR_CLASSES
              : NORMAL_CLASSES
          }`}
        />
      </div>
    ),
    [formik, renderError]
  );

  const renderSelect = useCallback(
    ({ id, label, options, placeholder }) => (
      <div className="relative">
        <label htmlFor={id} className={LABEL_CLASSES}>
          {label}
        </label>
        {renderError(id)}
        <Select
          id={id}
          options={options}
          placeholder={placeholder}
          onChange={(option) => formik.setFieldValue(id, option.value)}
          styles={getSelectStyles(id)}
          className="text-left"
        />
      </div>
    ),
    [formik, renderError, getSelectStyles]
  );

  return (
    <div className="mx-auto flex w-full flex-col items-center">
      <form onSubmit={formik.handleSubmit} className="w-full space-y-2 p-6">
        <h2 className="text-center text-2xl font-bold text-slate-800 capitalize">
          Create New Task
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {renderInput({
            id: "title",
            label: "Title",
            placeholder: "Enter post title",
          })}
          {renderInput({
            id: "vendor",
            label: "Vendor",
            placeholder: "Enter vendor name",
          })}
          {renderInput({
            id: "amount",
            label: "Amount",
            type: "number",
            placeholder: "Enter amount",
            extraProps: { min: "0.00", step: "0.01" },
          })}
          {renderSelect({
            id: "approver",
            label: "Approver",
            options: approvers,
          })}
          {renderSelect({
            id: "category",
            label: "Category",
            options:
              categoriesData?.data?.categories?.map((category) => ({
                value: category._id,
                label: category.category,
              })) || [],
            placeholder: "Select a Category",
          })}
          {renderSelect({
            id: "subCategory",
            label: "Subcategory",
            options:
              subCategoriesData?.data?.subCategories?.map((subCategory) => ({
                value: subCategory._id,
                label: subCategory.title,
              })) || [],
            placeholder: "Select a Subcategory",
          })}
        </div>

        <button
          type="submit"
          className={BUTTON_CLASSES}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Task..." : "Create Task"}
        </button>
      </form>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.isError ? "Error" : "Success"}
      >
        <p
          className={`text-center ${
            modalState.isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {modalState.message}
        </p>
      </Modal>
    </div>
  );
};

export default CreateTask;
