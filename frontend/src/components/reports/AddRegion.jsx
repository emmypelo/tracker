import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addRegionApi } from "../../APIrequests/regionAPI";
import Modal from "../common/Modal";
import { useSelector } from "react-redux";

const AddRegion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const mutation = useMutation({
    mutationKey: ["add-region"],
    mutationFn: (values) => addRegionApi(values),
    onSuccess: () => {
      setModalMessage("Region added successfully.");
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
    <section className="flex items-center justify-center w-3/5 mx-auto mt-3">
      <div className="w-full space-y-8 rounded-lg shadow-xl bg-gray-800">
        {mutation.isLoading && (
          <div className="absolute top-5 w-full text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              Adding region...
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
          Add Region
        </h2>
        <form className="mt-8 p-4 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <label
              htmlFor="title"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Region Title
            </label>
            {renderError("title")}
            <input
              type="text"
              name="title"
              id="title"
              {...formik.getFieldProps("title")}
              placeholder="Enter region title"
              className={`bg-gray-50 border ${
                formik.errors.title && formik.touched.title
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="rss"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              RSS Feed
            </label>
            {renderError("rss")}
            <input
              type="text"
              name="rss"
              id="rss"
              {...formik.getFieldProps("rss")}
              placeholder="Enter RSS "
              className={`bg-gray-50 border ${
                formik.errors.rss && formik.touched.rss
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="supervisor"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Supervisor
            </label>
            {renderError("supervisor")}
            <input
              type="text"
              name="supervisor"
              id="supervisor"
              {...formik.getFieldProps("supervisor")}
              placeholder="Enter supervisor name"
              className={`bg-gray-50 border ${
                formik.errors.supervisor && formik.touched.supervisor
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg focus:ring-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Region"}
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

export default AddRegion;
