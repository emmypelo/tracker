/* eslint-disable react/prop-types */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { taskDetailsApi, updateTaskApi } from "../APIrequests/taskAPI";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  User,
  Briefcase,
  Calendar,
  Clock,
  FolderOpen,
  FolderOpenDot,
  Edit2,
} from "lucide-react";
import AlertComponent from "./AlertComponent";

const TaskDetails = () => {
  const { taskId } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState({
    isApproved: false,
    isPaid: false,
    isOngoing: false,
    isCompleted: false,
    progress: 0,
    remark: "",
  });
  const [alert, setAlert] = useState(null);

  const {
    error,
    isLoading,
    data: taskData,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ["taskDetails", taskId],
    queryFn: () => taskDetailsApi(taskId),
  });

  const taskMutation = useMutation({
    mutationKey: ["updateTask"],
    mutationFn: updateTaskApi,
    onSuccess: () => {
      taskRefetch();
      setEditMode(false);
      setAlert({ type: "success", message: "Task updated successfully!" });
    },
    onError: (error) => {
      setAlert({
        type: "error",
        message: `Error updating task: ${
          error.response?.data?.message || "User not logged in"
        }`,
      });
    },
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (task) => {
    setEditValues({
      isApproved: task.isApproved,
      isPaid: task.isPaid,
      isOngoing: task.isOngoing,
      isCompleted: task.isCompleted,
      progress: task.progress,
      remark: task.remark,
    });
    setEditMode(true);
  };

  const saveChanges = () => {
    taskMutation.mutate({ ...editValues, taskId });
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditValues({
      isApproved: false,
      isPaid: false,
      isOngoing: false,
      isCompleted: false,
      progress: 0,
      remark: "",
    });
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const task = taskData?.data?.task;
  if (!task || Object.keys(task).length === 0) return <NoTaskState />;

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
            <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
            <button
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 flex items-center ${
                editMode
                  ? "bg-red-100 text-red-500 hover:bg-red-200"
                  : "bg-blue-100 text-blue-500 hover:bg-blue-200"
              }`}
              onClick={() => (editMode ? cancelEditing() : startEditing(task))}
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
          <TaskInfoSection task={task} />
          <TaskEditForm
            editValues={editValues}
            editMode={editMode}
            onCancel={cancelEditing}
            onSave={saveChanges}
            onChange={handleEditChange}
          />
          <TaskDatesSection task={task} />
          <CategorySection task={task} />
          <ProgressSection task={task} />
        </div>
        <TaskFooter task={task} />
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

const NoTaskState = () => (
  <div className="text-gray-500 text-center p-4">
    <h2 className="text-2xl font-bold mb-2">No Task Found</h2>
    <p>The requested task could not be found.</p>
  </div>
);

const TaskInfoSection = ({ task }) => (
  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
    <p className="text-gray-600 mb-4">{task.description}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailRow icon={Briefcase} label="Vendor" value={task.vendor} />
      <DetailRow
        icon={DollarSign}
        label="Amount"
        value={`$${task.amount.toFixed(2)}`}
      />
      <DetailRow icon={User} label="Approver" value={task.approver} />
      <DetailRow
        icon={User}
        label="Handler"
        value={
          task.handler
            ? `${task.handler.firstname} ${task.handler.lastname}`
            : "Emmanuel Ogunleye"
        }
      />
    </div>
  </div>
);

const TaskEditForm = ({ editValues, editMode, onCancel, onSave, onChange }) => (
  <div className={`mb-6 ${editMode ? "block" : "hidden"}`}>
    <form className="space-y-4 border border-blue-300 p-4 rounded-lg bg-blue-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectField
          name="isApproved"
          label="Approval"
          value={editValues.isApproved}
          onChange={(value) => onChange("isApproved", value === "true")}
          options={[
            { value: "true", label: "Approved" },
            { value: "false", label: "Pending" },
          ]}
        />
        <SelectField
          name="isPaid"
          label="Payment"
          value={editValues.isPaid}
          onChange={(value) => onChange("isPaid", value === "true")}
          options={[
            { value: "true", label: "Paid" },
            { value: "false", label: "Pending" },
          ]}
        />
        <SelectField
          name="isOngoing"
          label="Ongoing"
          value={editValues.isOngoing}
          onChange={(value) => onChange("isOngoing", value === "true")}
          options={[
            { value: "true", label: "Ongoing" },
            { value: "false", label: "Pending" },
          ]}
        />
        <SelectField
          name="isCompleted"
          label="Completed"
          value={editValues.isCompleted}
          onChange={(value) => onChange("isCompleted", value === "true")}
          options={[
            { value: "true", label: "Completed" },
            { value: "false", label: "Pending" },
          ]}
        />
        <input
          type="number"
          value={editValues.progress}
          onChange={(e) => onChange("progress", parseInt(e.target.value, 10))}
          placeholder="Progress"
          className="block w-full p-2 border rounded"
        />
        <textarea
          name="remark"
          value={editValues.remark}
          onChange={(e) => onChange("remark", e.target.value)}
          placeholder="Add remark"
          className="block w-full p-2 border rounded resize-none"
          rows={1}
        />
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
          type="button"
          onClick={onSave}
          className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          Update
        </button>
      </div>
    </form>
  </div>
);

const TaskDatesSection = ({ task }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailRow
        icon={Calendar}
        label="Created"
        value={new Date(task.createdAt).toLocaleDateString()}
      />
      <DetailRow
        icon={Clock}
        label="Updated"
        value={new Date(task.updatedAt).toLocaleDateString()}
      />
    </div>
  </div>
);

const CategorySection = ({ task }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DetailRow
        icon={FolderOpen}
        label="Category"
        value={task.category?.category}
      />
      {task.subCategory && (
        <DetailRow
          icon={FolderOpenDot}
          label="Subcategory"
          value={task.subCategory.title}
        />
      )}
    </div>
  </div>
);

const ProgressSection = ({ task }) => (
  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
    <h2 className="text-lg font-semibold mb-2">Progress</h2>
    <ProgressBar progress={task.progress} />
    <p className="mt-2 text-sm text-gray-600">{task.remark}</p>
  </div>
);

const TaskFooter = ({ task }) => (
  <div className="bg-gray-100 px-6 py-4">
    <div className="flex flex-wrap gap-4">
      <StatusBadge label="Approved" isActive={task.isApproved} />
      <StatusBadge label="Paid" isActive={task.isPaid} />
      <StatusBadge label="Ongoing" isActive={task.isOngoing} />
      <StatusBadge label="Completed" isActive={task.isCompleted} />
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
      value={value.toString()}
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

const ProgressBar = ({ progress }) => (
  <div className="flex items-center">
    <div className="flex-grow">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
    <span className="ml-4 text-sm font-medium text-gray-700">{progress}%</span>
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

export default TaskDetails;
