/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
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

  const [filters, setFilters] = useState({
    region: "",
    reportCategory: "",
    title: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedFetchReports = useCallback(
    debounce((newFilters) => {
      queryClient.invalidateQueries(["fetchReports", newFilters]);
    }, 300),
    [queryClient]
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFetchReports(newFilters);
  };

  const {
    isLoading: isReportsLoading,
    isError: isReportsError,
    data: reportsData,
    error: reportsError,
    refetch: reportRefetch,
  } = useQuery({
    queryKey: ["fetchReports", filters],
    queryFn: () => fetchReportsApi(filters),
    keepPreviousData: true,
  });

  const { data: regionsData } = useQuery({
    queryKey: ["fetchRegions"],
    queryFn: fetchRegionsApi,
  });

  const { data: reportCategoriesData } = useQuery({
    queryKey: ["fetchReportCategories"],
    queryFn: fetchReportCategoriesApi,
  });

  const reportMutation = useMutation({
    mutationKey: ["updateReport"],
    mutationFn: updateReportApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetchReports", filters]);
    },
  });

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

  const handleDelete = async (reportId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    deleteMutation.mutateAsync(reportId).catch((error) => {
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
    });
  };

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
      navigate("/");
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
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    debouncedFetchReports(clearedFilters);
  };

  if (isReportsLoading) return <h2>Loading reports...</h2>;
  if (isReportsError)
    return <h2>Error: {reportsError?.message || "Something went wrong"}</h2>;

  const reports = reportsData?.data?.reports || [];
  const regions = regionsData?.data?.regions || [];
  const reportCategories = reportCategoriesData?.data?.categories || [];

  return (
    <div className="relative px-1">
      <div className="sticky top-[4.6rem] left-0 right-0 bg-white shadow-md z-30">
        <div className="flex justify-between items-center w-full h-16 px-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Reports Dashboard</h1>
          <Link
            to="/report"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            New Report
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb py-6 px-4 sticky top-[8.5rem] z-20 bg-gray-100 h-[9rem]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 ">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border px-1 rounded w-1/2 md:w-1/4 py-0"
          />
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="border p-2 rounded hidden md:inline appearance-none"
          >
            <option value="">All Regions</option>
            {regions?.map((region) => (
              <option key={region._id} value={region._id}>
                {region.title}
              </option>
            ))}
          </select>
          <select
            value={filters.reportCategory}
            onChange={(e) =>
              handleFilterChange("reportCategory", e.target.value)
            }
            className="border p-2 rounded hidden md:inline appearance-none"
          >
            <option value="">All Categories</option>
            {reportCategories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.title}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label htmlFor="from">From:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border p-2 rounded"
              name="from"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="to">To:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border p-2 rounded"
              name="to"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="border p-2 rounded appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </form>
      </div>

      {reports.length === 0 ? (
        <div>No reports found</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="sticky top-[17rem] bg-gray-200 text-sm">
                <th className="border p-1 w-[5%]">S/N</th>
                <th className="border p-1 w-[25%]">Title</th>
                <th className="border p-1 w-[15%]">Region</th>
                <th className="border p-1 w-[15%]">Category</th>
                <th className="border p-1 w-[10%]">Status</th>
                <th className="border p-1 w-[20%]">Comment</th>
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
                  <td className="border px-1 py-2">{index + 1}</td>
                  <td
                    className="border px-4 py-2 cursor-pointer text-blue-800 font-bold"
                    onClick={() => navigate(`/reports/${report?._id}`)}
                  >
                    {report.title}
                  </td>
                  <td className="border px-4 py-2">
                    {report.region?.title || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
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
                  <td className="border px-4 py-2">
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
                          <IoCheckmarkDoneSharp className="w-3h-3" />
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

export default FetchReport;
