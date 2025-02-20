/* eslint-disable react/prop-types */
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { reportDetailsApi, updateReportApi } from "../../APIrequests/reportAPI";
import {
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  User,
  Calendar,
  Clock,
  Edit2,
  Droplet,
} from "lucide-react";
import AlertComponent from "../common/AlertComponent";
import { useSelector } from "react-redux";

const ReportDetails = () => {
  const { reportId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    status: "",
    comment: "",
  });
  const [alert, setAlert] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const {
    error,
    isLoading,
    data: reportData,
    refetch: reportRefetch,
  } = useQuery({
    queryKey: ["reportDetails", reportId],
    queryFn: () => reportDetailsApi(reportId),
  });

  const reportMutation = useMutation({
    mutationKey: ["updateReport"],
    mutationFn: updateReportApi,
    onSuccess: () => {
      reportRefetch();
      setEditMode(false);
      setAlert({ type: "success", message: "Report updated successfully!" });
    },
    onError: (error) => {
      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else {
        setAlert({
          type: "error",
          message:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "An unexpected error occurred",
        });
      }
    },
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (report) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setEditValues({
      status: report.status,
      comment: report.comment,
    });
    setEditMode(true);
  };

  const saveChanges = () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    reportMutation.mutate({ ...editValues, reportId });
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditValues({
      status: "",
      comment: "",
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const report = reportData?.data?.report;
  if (!report || Object.keys(report).length === 0) return <NoReportState />
  return (
    <div className="container mx-auto px-4 py-8">
      {alert && (
        <AlertComponent
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{report.title}</h1>
            <button
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center ${
                editMode
                  ? "bg-red-100 text-red-500 hover:bg-red-200"
                  : "bg-blue-100 text-blue-500 hover:bg-blue-200"
              }`}
              onClick={() =>
                editMode ? cancelEditing() : startEditing(report)
              }
            >
              {editMode ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </button>
          </div>
          <ReportInfoSection report={report} />
          <ReportEditForm
            editValues={editValues}
            editMode={editMode}
            onCancel={cancelEditing}
            onSave={saveChanges}
            onChange={handleEditChange}
          />
          <ReportDatesSection report={report} />
          <CategorySection report={report} />
        </div>
        <ReportFooter report={report} />
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="text-red-500 text-center p-4">
    <h2 className="text-2xl font-bold mb-2">Error</h2>
    <p>{error.message}</p>
  </div>
);

const NoReportState = () => (
  <div className="text-gray-500 text-center p-4">
    <h2 className="text-2xl font-bold mb-2">No Report Found</h2>
    <p>The requested report could not be found.</p>
  </div>
);

const ReportInfoSection = ({ report }) => (
  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
    <p className="text-gray-600 mb-4">{report.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailRow icon={MapPin} label="Region" value={report.region.title} />
      <DetailRow
        icon={FileText}
        label="Category"
        value={report.reportCategory.title}
      />
      <DetailRow icon={User} label="Station" value={report?.station?.name} />
      <DetailRow icon={Droplet} label="Pump" value={report.pump || "N/A"} />
    </div>
  </div>
);

const ReportEditForm = ({
  editValues,
  editMode,
  onCancel,
  onSave,
  onChange,
}) => (
  <div className={`mb-6 ${editMode ? "block" : "hidden"}`}>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-4 border border-blue-300 p-4 rounded-lg bg-blue-50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          name="status"
          label="Status"
          value={editValues.status}
          onChange={(value) => onChange("status", value)}
          options={[
            { value: "Open", label: "Open" },
            { value: "In Progress", label: "In Progress" },
            { value: "Closed", label: "Closed" },
          ]}
        />
        <div>
          <label htmlFor="comment" className="block font-semibold mb-1 text-sm">
            Comment
          </label>
          <textarea
            name="comment"
            value={editValues.comment}
            onChange={(e) => onChange("comment", e.target.value)}
            placeholder="Add comment"
            className="block w-full p-2 border rounded resize-none"
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          Update
        </button>
      </div>
    </form>
  </div>
);

const ReportDatesSection = ({ report }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailRow
        icon={Calendar}
        label="Created"
        value={new Date(report.createdAt).toLocaleDateString()}
      />
      <DetailRow
        icon={Clock}
        label="Updated"
        value={new Date(report.updatedAt).toLocaleDateString()}
      />
    </div>
  </div>
);

const CategorySection = () => (
  <div className="bg-gray-50 p-4 rounded-lg mt-4 hidden"></div>
);

const ReportFooter = ({ report }) => (
  <div className="bg-gray-100 px-6 py-4">
    <div className="flex flex-wrap gap-4">
      <StatusBadge label={report.status} isActive={true} />
    </div>
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center">
    <Icon className="w-5 h-5 mr-2 text-gray-500" />
    <span className="font-semibold mr-2">{label}:</span>
    <span>{value}</span>
  </div>
);

const SelectField = ({ name, label, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block font-semibold mb-1 text-sm">
      {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full p-2 border rounded text-gray-700 text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const StatusBadge = ({ label, isActive }) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-semibold flex items-center transition-colors duration-200";
  const activeClasses = "bg-green-100 text-green-800";
  const inactiveClasses = "bg-gray-200 text-gray-800";

  return (
    <span
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {isActive ? (
        <CheckCircle className="w-4 h-4 mr-1" />
      ) : (
        <XCircle className="w-4 h-4 mr-1" />
      )}
      {label}
    </span>
  );
};

export default ReportDetails;
