import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addSubCategoryApi } from "../APIrequests/subCategoryAPI";
import Modal from "./Modal"; // Import the Modal component
import { useState } from "react";

const AddSubCategory = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const subCategoryMutation = useMutation({
    mutationKey: ["add-subcategory"],
    mutationFn: addSubCategoryApi,
    onSuccess: () => {
      setModalMessage("Subcategory added successfully.");
      setIsError(false);
      setIsModalOpen(true);
    },
    onError: (error) => {
      setModalMessage(error.response?.data?.message || "An error occurred.");
      setIsError(true);
      setIsModalOpen(true);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      await subCategoryMutation.mutateAsync(values);
    },
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
    <section className="flex items-center justify-center w-full">
      <div className="w-full space-y-8 rounded-lg shadow-xl bg-gray-800">
        {subCategoryMutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding subcategory...
            </h2>
          </div>
        )}
        {subCategoryMutation.isError && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-red-500">
              {subCategoryMutation.error?.response?.data?.message ||
                subCategoryMutation.error?.message}
            </h2>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white bg-slate-900 rounded-t-lg py-2">
          Add Subcategory
        </h2>
        <form className="mt-8 px-3 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <label
              htmlFor="title"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Subcategory Name
            </label>
            {renderError("title")}
            <input
              type="text"
              name="title"
              id="title"
              {...formik.getFieldProps("title")}
              placeholder="Enter subcategory name"
              className={`bg-gray-50 border ${
                formik.errors.title && formik.touched.title
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              {...formik.getFieldProps("description")}
              placeholder="Enter subcategory description"
              className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white focus:ring-4 sm:w-auto bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Subcategory"}
          </button>
        </form>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
        buttonText="Close"
      >
        <p
          className={`text-center ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {modalMessage}
        </p>
      </Modal>
    </section>
  );
};

export default AddSubCategory;
