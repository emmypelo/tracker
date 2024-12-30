import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addReportCategoryApi } from "../../APIrequests/reportCategoryAPI";
import { useSelector } from "react-redux";
import Modal from "../common/Modal";

const AddReportCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const mutation = useMutation({
    mutationKey: ["add-report-category"],
    mutationFn: (values) => addReportCategoryApi(values),
    onSuccess: () => {
      setModalMessage("Report category added successfully.");
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
      title: Yup.string().required("Report category title is required"),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      if (!isAuthenticated) {
        navigate("/signin", { state: { from: location } });
        return;
      }
      await mutation.mutateAsync(values);
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
    <section className="flex items-center justify-center w-3/5 mt-3 mx-auto">
      <div className="w-full space-y-8 rounded-lg shadow-xl bg-gray-800">
        {mutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding report category...
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
          Add Report Category
        </h2>
        <form className="mt-8 p-4 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <label
              htmlFor="title"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Report Category Title
            </label>
            {renderError("title")}
            <input
              type="text"
              name="title"
              id="title"
              {...formik.getFieldProps("title")}
              placeholder="Enter report category title"
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
              placeholder="Enter report category description"
              className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg focus:ring-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Report Category"}
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

export default AddReportCategory;
