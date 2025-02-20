import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchRegionsApi } from "../../APIrequests/regionAPI";
import { fetchReportCategoriesApi } from "../../APIrequests/reportCategoryAPI";
import { createReportApi } from "../../APIrequests/reportAPI";
import Modal from "../common/Modal";
import { fetchStationsApi } from "../../APIrequests/stationsApi";

const CreateReport = () => {
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);

  const reportMutation = useMutation({
    mutationFn: createReportApi,
    onSuccess: () => {
      setIsError(false);
      setModalMessage("Report created successfully");
      setIsModalOpen(true);
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Report creation failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        errorMessage = "Login required";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const { data: regionsData } = useQuery({
    queryKey: ["fetchRegions"],
    queryFn: fetchRegionsApi,
  });

  const { data: reportCategoriesData } = useQuery({
    queryKey: ["fetchReportCategories"],
    queryFn: fetchReportCategoriesApi,
  });

  const { data: stationsData } = useQuery({
    queryKey: ["fetchStations"],
    queryFn: fetchStationsApi,
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      region: "",
      reportCategory: "",
      description: "",
      station: "",
      pump: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      region: Yup.string().required("Region is required"),
      reportCategory: Yup.string().required("Category is required"),
      description: Yup.string(),
      station: Yup.string().required("Station is required"),
      pump: Yup.string().when("reportCategory", {
        is: (category) => {
          const pumpCategory = reportCategoriesData?.data?.categories?.find(
            (c) => c.title === "Pumps"
          );
          return category === pumpCategory?._id;
        },
        then: () => Yup.string().required("Pump info required"),
        otherwise: () => Yup.string(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const formattedValues = {
          ...values,
        };

        await reportMutation.mutateAsync(formattedValues);
      } catch (error) {
        console.error("Error in form submission:", error);
      }
    },
  });

  useEffect(() => {
    if (selectedRegion && stationsData?.data?.stations) {
      const stations = stationsData.data.stations.filter(
        (station) => station.region._id === selectedRegion
      );
      setFilteredStations(stations);
    }
  }, [selectedRegion, stationsData]);

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
      navigate("/reports");
    }
  };

  return (
    <div className="flex flex-col w-full items-center mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit(e);
        }}
        className="relative w-full space-y-2 p-6"
      >
        <h2 className="text-2xl font-bold text-slate-800 text-center capitalize">
          Create New Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Title Input */}
          <div className="relative">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Title
            </label>
            {renderError("title")}
            <input
              id="title"
              type="text"
              placeholder="Enter report title"
              {...formik.getFieldProps("title")}
              className={`w-full p-2.5 border rounded-md ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>

          {/* Region Select */}
          <div className="relative">
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Region
            </label>
            {renderError("region")}
            <Select
              id="region"
              options={regionsData?.data?.regions?.map((region) => ({
                value: region._id,
                label: region.title,
              }))}
              onChange={(option) => {
                formik.setFieldValue("region", option.value);
                setSelectedRegion(option.value);
                formik.setFieldValue("station", "");
              }}
              className={`${
                formik.touched.region && formik.errors.region
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.region && formik.errors.region
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Station Select */}
          <div className="relative">
            <label
              htmlFor="station"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Station
            </label>
            {renderError("station")}
            <Select
              id="station"
              options={filteredStations.map((station) => ({
                value: station._id,
                label: station.name,
              }))}
              onChange={(option) =>
                formik.setFieldValue("station", option.value)
              }
              value={
                filteredStations.find(
                  (station) => station._id === formik.values.station
                )
                  ? {
                      value: formik.values.station,
                      label: filteredStations.find(
                        (station) => station._id === formik.values.station
                      ).name,
                    }
                  : null
              }
              isDisabled={!selectedRegion}
              className={`${
                formik.touched.station && formik.errors.station
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.station && formik.errors.station
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Report Category Select */}
          <div className="relative">
            <label
              htmlFor="reportCategory"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Report Category
            </label>
            {renderError("reportCategory")}
            <Select
              id="reportCategory"
              options={reportCategoriesData?.data?.categories?.map(
                (category) => ({
                  value: category._id,
                  label: category.title,
                })
              )}
              onChange={(option) => {
                formik.setFieldValue("reportCategory", option.value);
                setSelectedCategory(option.value);
                if (option.label !== "Pumps") {
                  formik.setFieldValue("pump", "");
                }
              }}
              className={`${
                formik.touched.reportCategory && formik.errors.reportCategory
                  ? "border-red-500"
                  : ""
              }`}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor:
                    formik.touched.reportCategory &&
                    formik.errors.reportCategory
                      ? "#ef4444"
                      : "#d1d5db",
                  boxShadow: "none",
                }),
              }}
            />
          </div>

          {/* Pump Input (Conditional) */}
          {reportCategoriesData?.data?.categories?.find(
            (c) => c._id === selectedCategory
          )?.title === "Pumps" && (
            <div className="relative">
              <label
                htmlFor="pump"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                Pump
              </label>
              {renderError("pump")}
              <input
                id="pump"
                type="text"
                placeholder="Enter pump details"
                {...formik.getFieldProps("pump")}
                className={`w-full p-2.5 border rounded-md ${
                  formik.touched.pump && formik.errors.pump
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>
          )}

          {/* Description Input */}
          <div className="relative">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
            >
              Description
            </label>
            {renderError("description")}
            <textarea
              id="description"
              placeholder="Enter description"
              {...formik.getFieldProps("description")}
              className={`w-full p-2.5 border rounded-md ${
                formik.touched.description && formik.errors.description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-1/3 px-5 py-3 mt-8 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Report..." : "Create Report"}
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

export default CreateReport;
