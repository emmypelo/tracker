"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteReportApi,
  fetchReportsApi,
  updateReportApi,
} from "../../APIrequests/reportAPI";
import { fetchReportCategoriesApi } from "../../APIrequests/reportCategoryAPI";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import { fetchRegionsApi } from "../../APIrequests/regionAPI";
import Modal from "../common/Modal";
import { fetchStationsApi } from "../../APIrequests/stationsAPI";
import { Search, X } from "lucide-react";

// Skeleton component for loading state
const ReportSkeleton = ({ rows = 5 }) => {
  return (
    <div className="animate-pulse">
      <table className="w-full border-collapse border border-gray-300 bg-white">
        <thead>
          <tr className="sticky top-[13.1rem] bg-gray-200 text-sm">
            <th className="border p-1 w-[5%] hidden md:table-cell">S/N</th>
            <th className="border p-1 w-[25%]">Title</th>
            <th className="border p-1 w-[15%] hidden md:table-cell">Region</th>
            <th className="border p-1 w-[10%] hidden md:table-cell">Station</th>
            <th className="border p-1 w-[15%] hidden md:table-cell">
              Category
            </th>
            <th className="border p-1 w-[10%]">Status</th>
            <th className="border p-1 w-[20%] hidden md:table-cell">Comment</th>
            <th className="border p-1 w-[10%]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array(rows)
            .fill()
            .map((_, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 text-sm md:text-base h-12 max-h-36"
              >
                <td className="border px-1 py-2 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-4 mx-auto"></div>
                </td>
                <td className="border px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td className="border px-4 py-2 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="border px-4 py-2 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="border px-4 py-2 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="border px-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="border px-4 py-2 hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="border px-4 py-2">
                  <div className="flex justify-between">
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const FetchReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [isError, setIsError] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [filters, setFilters] = useState({
    region: "",
    reportCategory: "",
    title: "",
    status: "",
    station: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedFetchReports = useCallback(
    debounce((newFilters) => {
      queryClient.invalidateQueries(["fetchReports", newFilters]);
    }, 300),
    []
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFetchReports(newFilters);
  };

  const {
    isError: isReportsError,
    data: reportsData,
    error: reportsError,
    refetch: reportRefetch,
    isLoading: isReportsLoading,
  } = useQuery({
    queryKey: ["fetchReports", filters],
    queryFn: () => fetchReportsApi(filters),
    keepPreviousData: true,
  });

  const { data: regionsData } = useQuery({
    queryKey: ["fetchRegions"],
    queryFn: fetchRegionsApi,
  });

  const { data: stationsData } = useQuery({
    queryKey: ["fetchStations"],
    queryFn: fetchStationsApi,
  });

  const { data: reportCategoriesData } = useQuery({
    queryKey: ["fetchReportCategories"],
    queryFn: fetchReportCategoriesApi,
  });

  // Get stations based on selected region
  const filteredStations = useMemo(() => {
    const stations = stationsData?.data?.stations || [];
    if (!filters.region) {
      return stations; // Return all stations if no region selected
    }
    // Filter stations by selected region
    return stations.filter((station) => station.region?._id === filters.region);
  }, [stationsData?.data?.stations, filters.region]);

  const reportMutation = useMutation({
    mutationKey: ["updateReport"],
    mutationFn: updateReportApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetchReports", filters]);
    },
  });

  const handleDelete = async (reportId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setReportToDelete(reportId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      await deleteMutation.mutateAsync(reportToDelete);
      setIsError(false);
      setModalMessage("Report deleted successfully");
    } catch (error) {
      setIsError(true);
      let errorMessage = "Deleting failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setModalMessage(errorMessage);
    } finally {
      setIsModalOpen(false);
      setReportToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setReportToDelete(null);
  };

  const deleteMutation = useMutation({
    mutationKey: ["deleteReport"],
    mutationFn: deleteReportApi,
    onSuccess: () => {
      setIsError(false);
      setModalMessage("Report deleted successfully");
      setIsModalOpen(true);
      reportRefetch();
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Deleting failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const [editValues, setEditValues] = useState({
    status: "",
    comment: "",
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (report) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setEditingRowId(report._id);
    setEditValues({
      status: report.status,
      comment: report.comment,
    });
  };

  const saveChanges = async () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    const updateData = {
      ...editValues,
      reportId: editingRowId,
    };

    try {
      await reportMutation.mutateAsync(updateData);

      setIsError(false);
      setModalMessage("Report updated successfully");
      setIsModalOpen(true);
    } catch (error) {
      setIsError(true);
      let errorMessage = "Report update failed";

      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    } finally {
      setEditingRowId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError) {
      navigate("/reports");
    }
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({
      status: "",
      comment: "",
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("title", searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm("");
    const clearedFilters = {
      region: "",
      reportCategory: "",
      title: "",
      status: "",
      station: "",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    debouncedFetchReports(clearedFilters);
  };

  if (isReportsError)
    return <h2>Error: {reportsError?.message || "Something went wrong"}</h2>;

  const reports = reportsData?.data?.reports || [];
  const regions = regionsData?.data?.regions || [];
  const reportCategories = reportCategoriesData?.data?.categories || [];

  return (
    <div className="relative px-1">
      <div className="sticky top-[4.6rem] left-0 right-0 bg-white shadow-md z-30">
        <div className="flex justify-between items-center w-full h-16 px-4 bg-gray-800 text-white">
          <h1 className="text-l font-bold">Reports Dashboard</h1>
          <Link
            to="/report"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            New Report
          </Link>
        </div>
      </div>
      <div className="sticky top-[8.5rem] z-20 bg-gray-100 h-[4.5rem]">
        <form onSubmit={handleSearchSubmit} className="h-full px-4 py-2">
          <div className="flex items-center gap-2 h-full">
            <input
              type="text"
              placeholder="Search by title"
              value={searchTerm}
              onChange={handleSearchChange}
              className="border p-2 rounded min-w-[100px] w-full md:w-auto"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="border p-2 rounded appearance-none w-28"
            >
              <option value="">Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              className="border p-2 rounded appearance-none w-36 hidden md:block"
            >
              <option value="">All Regions</option>
              {regions?.map((region) => (
                <option key={region._id} value={region._id}>
                  {region.title}
                </option>
              ))}
            </select>
            <select
              value={filters.station}
              onChange={(e) => handleFilterChange("station", e.target.value)}
              className="border p-2 rounded appearance-none w-36 hidden md:block"
            >
              <option value="">All Stations</option>
              {filteredStations?.map((station) => (
                <option key={station._id} value={station._id}>
                  {station.name}
                </option>
              ))}
            </select>
            <select
              value={filters.reportCategory}
              onChange={(e) =>
                handleFilterChange("reportCategory", e.target.value)
              }
              className="border p-2 rounded appearance-none w-36 hidden lg:block"
            >
              <option value="">All Categories</option>
              {reportCategories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
            <div className="items-center gap-2 hidden lg:flex">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="border p-2 rounded w-32"
                placeholder="From"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="border p-2 rounded w-32"
                placeholder="To"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex-shrink-0"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {isReportsLoading ? (
        <ReportSkeleton rows={8} />
      ) : reports.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No reports found</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="sticky top-[13.1rem] bg-gray-200 text-sm">
                <th className="border p-1 w-[5%] hidden md:table-cell">S/N</th>
                <th className="border p-1 w-[25%]">Title</th>
                <th className="border p-1 w-[15%] hidden md:table-cell">
                  Region
                </th>
                <th className="border p-1 w-[10%] hidden md:table-cell">
                  Station
                </th>
                <th className="border p-1 w-[15%] hidden md:table-cell">
                  Category
                </th>
                <th className="border p-1 w-[10%]">Status</th>
                <th className="border p-1 w-[20%] hidden md:table-cell">
                  Comment
                </th>
                <th className="border p-1 w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr
                  key={report._id}
                  className={`hover:bg-gray-100 text-sm md:text-base h-12 max-h-36 ${
                    editingRowId === report._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="border px-1 py-2 hidden md:table-cell">
                    {index + 1}
                  </td>
                  <td
                    className="border px-4 py-2 cursor-pointer text-blue-800 font-bold"
                    onClick={() => navigate(`/reports/${report?._id}`)}
                  >
                    {report.title}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {report.region?.title || "N/A"}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {report.station?.name || "N/A"}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {report.reportCategory?.title || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === report._id ? (
                      <select
                        value={editValues.status}
                        onChange={(e) =>
                          handleEditChange("status", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    ) : (
                      report.status
                    )}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {editingRowId === report._id ? (
                      <input
                        type="text"
                        value={editValues.comment}
                        onChange={(e) =>
                          handleEditChange("comment", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      report.comment
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === report._id ? (
                      <div className="flex justify-between">
                        <button
                          onClick={saveChanges}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1"
                        >
                          <IoCheckmarkDoneSharp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdOutlineCancel className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <button
                          onClick={() => startEditing(report)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        >
                          <FiEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdDelete className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
        isDeleteAction={!!reportToDelete}
        onDelete={confirmDelete}
        onCancel={cancelDelete}
        deleteConfirmationText="Are you sure you want to delete this report? This action cannot be undone."
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default FetchReport;
