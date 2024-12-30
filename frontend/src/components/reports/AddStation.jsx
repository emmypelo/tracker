import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { fetchRegionsApi } from "../../APIrequests/regionAPI";
import Modal from "../common/Modal";
import { useSelector } from "react-redux";
import { addStationApi } from "../../APIrequests/stationsApi";

const AddStation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: fetchRegionsApi,
  });
  console.log(regions);
  const mutation = useMutation({
    mutationKey: ["add-station"],
    mutationFn: (values) => addStationApi(values),
    onSuccess: () => {
      setModalMessage("Station added successfully.");
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
      name: "",
      region: "",
      managerName: "",
      managerPhone: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Station name is required"),
      region: Yup.string().required("Region is required"),
      managerName: Yup.string().required("Manager name is required"),
      managerPhone: Yup.string().required("Manager phone is required"),
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
              Adding station...
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
          Add Station
        </h2>
        <form className="mt-8 p-4 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="relative">
            <label
              htmlFor="name"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Station Name
            </label>
            {renderError("name")}
            <input
              type="text"
              name="name"
              id="name"
              {...formik.getFieldProps("name")}
              placeholder="Enter station name"
              className={`bg-gray-50 border ${
                formik.errors.name && formik.touched.name
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="region"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Region
            </label>
            {renderError("region")}
            <select
              name="region"
              id="region"
              {...formik.getFieldProps("region")}
              className={`bg-gray-50 border ${
                formik.errors.region && formik.touched.region
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            >
              <option value="">Select a region</option>
              {regions?.data?.regions.map((region) => (
                <option key={regions._id} value={region._id}>
                  {region.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label
              htmlFor="managerName"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Manager Name
            </label>
            {renderError("managerName")}
            <input
              type="text"
              name="managerName"
              id="managerName"
              {...formik.getFieldProps("managerName")}
              placeholder="Enter manager name"
              className={`bg-gray-50 border ${
                formik.errors.managerName && formik.touched.managerName
                  ? "border-red-500"
                  : "border-gray-300"
              } text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white`}
            />
          </div>

          <div className="relative">
            <label
              htmlFor="managerPhone"
              className="text-left block mb-2 text-sm font-medium text-white"
            >
              Manager Phone
            </label>
            {renderError("managerPhone")}
            <input
              type="tel"
              name="managerPhone"
              id="managerPhone"
              {...formik.getFieldProps("managerPhone")}
              placeholder="Enter manager phone"
              className={`bg-gray-50 border ${
                formik.errors.managerPhone && formik.touched.managerPhone
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
            {formik.isSubmitting ? "Adding..." : "Add Station"}
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

export default AddStation;
