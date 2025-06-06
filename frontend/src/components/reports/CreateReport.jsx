import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { fetchRegionsApi } from "../../APIrequests/regionAPI";
import { fetchReportCategoriesApi } from "../../APIrequests/reportCategoryAPI";
import { createReportApi } from "../../APIrequests/reportAPI";
import { fetchStationsApi } from "../../APIrequests/stationsAPI";
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

const CreateReport = () => {
  const navigate = useNavigate();
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);

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

  const reportMutation = useMutation({
    mutationFn: createReportApi,
    onSuccess: () => {
      setModalState({
        isOpen: true,
        message: "Report created successfully",
        isError: false,
      });
    },
    onError: (error) => {
      const errorMessage =
        error.response?.status === 401 || error.message.includes("401")
          ? "Login required"
          : error.response?.data?.message || "Report creation failed";
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
        is: (category) =>
          reportCategoriesData?.data?.categories?.find(
            (c) => c._id === category && c.title === "Pumps"
          ),
        then: () => Yup.string().required("Pump info required"),
        otherwise: () => Yup.string(),
      }),
    }),
    onSubmit: (values) => reportMutation.mutate(values),
  });

  useEffect(() => {
    if (selectedRegion && stationsData?.data?.stations) {
      const stations = stationsData.data.stations.filter(
        (station) => station.region._id === selectedRegion
      );
      setFilteredStations(stations);
      // Only reset station if the current station is not in the filtered list
      if (
        formik.values.station &&
        !stations.find((station) => station._id === formik.values.station)
      ) {
        formik.setFieldValue("station", "");
      }
    } else {
      setFilteredStations([]);
      if (formik.values.station) {
        formik.setFieldValue("station", "");
      }
    }
  }, [selectedRegion, stationsData]); 

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (!modalState.isError) {
      formik.resetForm();
      navigate("/reports");
    }
  }, [modalState.isError, formik, navigate]);

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

  const renderTextarea = useCallback(
    ({ id, label, placeholder }) => (
      <div className="relative">
        <label htmlFor={id} className={LABEL_CLASSES}>
          {label}
        </label>
        {renderError(id)}
        <textarea
          id={id}
          placeholder={placeholder}
          {...formik.getFieldProps(id)}
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
    ({ id, label, options, placeholder, isDisabled = false, onChange }) => (
      <div className="relative">
        <label htmlFor={id} className={LABEL_CLASSES}>
          {label}
        </label>
        {renderError(id)}
        <Select
          id={id}
          options={options || []}
          placeholder={placeholder}
          onChange={onChange}
          value={
            options?.find((option) => option.value === formik.values[id]) ||
            null
          }
          isDisabled={isDisabled}
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
          Create New Report
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {renderInput({
            id: "title",
            label: "Title",
            placeholder: "Enter report title",
          })}
          {renderSelect({
            id: "region",
            label: "Region",
            options: regionsData?.data?.regions?.map((region) => ({
              value: region._id,
              label: region.title,
            })),
            placeholder: "Select a Region",
            onChange: (option) => {
              formik.setFieldValue("region", option.value);
              setSelectedRegion(option.value);
            },
          })}
          {renderSelect({
            id: "station",
            label: "Station",
            options: filteredStations.map((station) => ({
              value: station._id,
              label: station.name,
            })),
            placeholder: "Select a Station",
            isDisabled: !selectedRegion,
            onChange: (option) => formik.setFieldValue("station", option.value),
          })}
          {renderSelect({
            id: "reportCategory",
            label: "Report Category",
            options: reportCategoriesData?.data?.categories?.map(
              (category) => ({
                value: category._id,
                label: category.title,
              })
            ),
            placeholder: "Select a Category",
            onChange: (option) => {
              formik.setFieldValue("reportCategory", option.value);
              setSelectedCategory(option.value);
              if (option.label !== "Pumps") {
                formik.setFieldValue("pump", "");
              }
            },
          })}
          {reportCategoriesData?.data?.categories?.find(
            (c) => c._id === selectedCategory
          )?.title === "Pumps" &&
            renderInput({
              id: "pump",
              label: "Pump",
              placeholder: "Enter pump details",
            })}
          {renderTextarea({
            id: "description",
            label: "Description",
            placeholder: "Enter description",
          })}
        </div>

        <button
          type="submit"
          className={BUTTON_CLASSES}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Creating Report..." : "Create Report"}
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

export default CreateReport;
