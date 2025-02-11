// const Footer = () => {
//   return <div>Footer</div>;
// };

// export default Footer;


import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskApi, deleteTaskApi } from "../../APIrequests/taskAPI";
import {
  fetchSubCategory,
  updateSubCategoryApi,
} from "../../APIrequests/subCategoryAPI";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import Modal from "../common/Modal";

const SubcategoryDetails = () => {
  const { subCategoryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    isApproved: "",
    isPaid: "",
    isCompleted: "",
  });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Fetch subcategory details
  const {
    data,
    isLoading,
    isError: isSubCategoryError,
  } = useQuery({
    queryKey: ["fetch-subcategory", subCategoryId],
    queryFn: () => fetchSubCategory(subCategoryId),
    onSuccess: (data) => {
      const { title, description } = data.data.subCategory;
      setNewTitle(title);
      setNewDescription(description);
    },
  });

  // Mutations
  const handleMutationError = (error, defaultMessage) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      defaultMessage;
    setIsError(true);
    setModalMessage(errorMessage);
    setIsModalOpen(true);
  };

  const taskMutation = useMutation(updateTaskApi, {
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetch-subcategory", subCategoryId]);
    },
    onError: (error) => handleMutationError(error, "Task update failed"),
  });

  const deleteMutation = useMutation(deleteTaskApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetch-subcategory", subCategoryId]);
      setModalMessage("Task deleted successfully");
      setIsModalOpen(true);
      setIsError(false);
    },
    onError: (error) => handleMutationError(error, "Deleting task failed"),
  });

  const updateSubCategoryMutation = useMutation(updateSubCategoryApi, {
    onSuccess: () => {
      queryClient.invalidateQueries(["fetch-subcategory", subCategoryId]);
      setModalMessage("Subcategory updated successfully");
      setIsModalOpen(true);
      setIsError(false);
      setIsEditing(false);
    },
    onError: (error) => handleMutationError(error, "Subcategory update failed"),
  });

  // Helper functions
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const closeModal = () => setIsModalOpen(false);

  const filteredTasks = data?.data.subCategory.tasks.filter((task) =>
    Object.keys(filters).every(
      (key) => !filters[key] || task[key].toString() === filters[key]
    )
  );

  const startEditing = (task) => {
    setEditingRowId(task._id);
    setEditValues(task);
  };

  const saveChanges = () => {
    taskMutation.mutate({ ...editValues, taskId: editingRowId });
  };

  const handleSaveClick = () => {
    updateSubCategoryMutation.mutate({
      subCategoryId,
      title: newTitle,
      description: newDescription,
    });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (isSubCategoryError)
    return (
      <div className="text-center py-8 text-red-600">
        Error fetching subcategory details
      </div>
    );

  const { title, description, createdAt, updatedAt } = data.data.subCategory;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-3xl font-bold mb-2 w-full border rounded p-2"
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="text-gray-700 mb-4 w-full h-24 border rounded p-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveClick}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-gray-700 mb-4">
              {description || "No description provided."}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Edit Subcategory
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <div>
          <strong>Created:</strong> {new Date(createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>Last Updated:</strong>{" "}
          {new Date(updatedAt).toLocaleDateString()}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Tasks</h2>
      <div className="mb-4 flex gap-4">
        {["isApproved", "isPaid", "isCompleted"].map((key) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => handleFilterChange(key, e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All {key}</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">S/N</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Vendor</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Approved</th>
              <th className="border p-2">Paid</th>
              <th className="border p-2">Completed</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks?.map((task, index) => (
              <tr
                key={task._id}
                className={editingRowId === task._id ? "bg-yellow-50" : ""}
              >
                <td className="border px-2 py-2">{index + 1}</td>
                <td
                  className="border px-4 py-2 text-blue-800 font-bold"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                >
                  {task.title}
                </td>
                <td className="border px-4 py-2">{task.vendor}</td>
                <td className="border px-4 py-2">
                  ${task.amount.toLocaleString()}
                </td>
                {["isApproved", "isPaid", "isCompleted"].map((key) => (
                  <td key={key} className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <select
                        value={editValues[key]?.toString()}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [key]: e.target.value === "true",
                          })
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <span
                        className={
                          task[key] ? "text-green-600" : "text-red-600"
                        }
                      >
                        {task[key] ? "True" : "False"}
                      </span>
                    )}
                  </td>
                ))}
                <td className="border px-4 py-2">
                  {editingRowId === task._id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={saveChanges}
                        className="bg-green-500 text-white rounded-full p-1"
                      >
                        <IoCheckmarkDoneSharp />
                      </button>
                      <button
                        onClick={() => setEditingRowId(null)}
                        className="bg-red-500 text-white rounded-full p-1"
                      >
                        <MdOutlineCancel />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(task)}
                        className="bg-blue-500 text-white rounded-full p-1"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(task._id)}
                        className="bg-red-500 text-white rounded-full p-1"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default SubcategoryDetails;
