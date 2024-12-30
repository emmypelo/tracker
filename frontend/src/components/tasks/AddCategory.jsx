import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addCategoryApi } from "../../APIrequests/categoryAPI";
import { addSubCategoryApi } from "../../APIrequests/subCategoryAPI";
import { useSelector } from "react-redux";
import Modal from "../common/Modal";
const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [addType, setAddType] = useState("category");

  const mutation = useMutation({
    mutationKey: ["add-item"],
    mutationFn: (values) =>
      addType === "category"
        ? addCategoryApi(values)
        : addSubCategoryApi(values),
    onSuccess: () => {
      setModalMessage(
        `${
          addType === "category" ? "Category" : "Subcategory"
        } added successfully.`
      );
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
      [addType === "category" ? "category" : "title"]: "",
      description: "",
    },
    validationSchema: Yup.object({
      [addType === "category" ? "category" : "title"]: Yup.string().required(
        `${
          addType === "category" ? "Category" : "Subcategory"
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
    <section className="flex items-center justify-center w-3/5">
      <div className="w-full space-y-8 rounded-lg shadow-xl bg-gray-800">
        {mutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding {addType}...
            </h2>
          </div>
        )}
        {mutation.isError && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-red-500">
              {mutation.error?.response?.data?.message ||
                mutation.error?.message}
            </h2>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white bg-slate-900 rounded-t-lg py-2">
          Add {addType === "category" ? "Category" : "Subcategory"}
        </h2>
        <form className="mt-8 p-4 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="flex justify-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setAddType("category")}
              className={`px-4 py-2 rounded-lg ${
                addType === "category"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              Category
            </button>
            <button
              type="button"
              onClick={() => setAddType("subcategory")}
              className={`px-4 py-2 rounded-lg ${
                addType === "subcategory"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              Subcategory
            </button>
          </div>

          <div className="relative">
            <label
              htmlFor={addType === "category" ? "category" : "title"}
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              {addType === "category" ? "Category" : "Subcategory"} Name
            </label>
            {renderError(addType === "category" ? "category" : "title")}
            <input
              type="text"
              name={addType === "category" ? "category" : "title"}
              id={addType === "category" ? "category" : "title"}
              {...formik.getFieldProps(
                addType === "category" ? "category" : "title"
              )}
              placeholder={`Enter ${addType} name`}
              className={`bg-gray-50 border ${
                formik.errors[addType === "category" ? "category" : "title"] &&
                formik.touched[addType === "category" ? "category" : "title"]
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
              placeholder={`Enter ${addType} description`}
              className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg focus:ring-4  bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Adding..."
              : `Add ${addType === "category" ? "Category" : "Subcategory"}`}
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

export default AddCategory;
