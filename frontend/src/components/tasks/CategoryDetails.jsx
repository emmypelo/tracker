import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAcategory,
  updateCategoryApi,
} from "../../APIrequests/categoryAPI";
import { updateTaskApi, deleteTaskApi } from "../../APIrequests/taskAPI";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import Modal from "../common/Modal";

const CategoryDetails = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    isApproved: "",
    isPaid: "",
    isCompleted: "",
  });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({
    isApproved: false,
    isPaid: false,
    isCompleted: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const {
    data: categoryData,
    isLoading,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["fetch-Category", categoryId],
    queryFn: () => fetchAcategory(categoryId),
  });

  const taskMutation = useMutation({
    mutationKey: ["updateTask"],
    mutationFn: updateTaskApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetch-Category", categoryId]);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["deleteTask"],
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      setIsError(false);
      setModalMessage("Task deleted successfully");
      setIsModalOpen(true);
      queryClient.invalidateQueries(["fetch-Category", categoryId]);
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Deleting failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationKey: ["updateCategory"],
    mutationFn: updateCategoryApi,
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries(["fetch-Category", categoryId]);
      setIsError(false);
      setModalMessage("Category updated successfully");
      setIsModalOpen(true);
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Category update failed";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const { category, description, tasks, createdAt, updatedAt } = useMemo(() => {
    if (categoryData) {
      return categoryData.data.category;
    }
    return {
      category: "",
      description: "",
      tasks: [],
      createdAt: "",
      updatedAt: "",
    };
  }, [categoryData]);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      return (
        (filters.isApproved === "" ||
          task.isApproved.toString() === filters.isApproved) &&
        (filters.isPaid === "" || task.isPaid.toString() === filters.isPaid) &&
        (filters.isCompleted === "" ||
          task.isCompleted.toString() === filters.isCompleted)
      );
    });
  }, [tasks, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (task) => {
    setEditingRowId(task._id);
    setEditValues({
      isApproved: task.isApproved,
      isPaid: task.isPaid,
      isCompleted: task.isCompleted,
    });
  };

  const saveChanges = async () => {
    const updateData = {
      ...editValues,
      taskId: editingRowId,
    };

    try {
      await taskMutation.mutateAsync(updateData);
      setIsError(false);
      setModalMessage("Task updated successfully");
      setIsModalOpen(true);
    } catch (error) {
      setIsError(true);
      let errorMessage = "Task update failed";
      if (error.response?.data?.error) {
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

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({
      isApproved: false,
      isPaid: false,
      isCompleted: false,
    });
  };

  const handleDelete = async (taskId) => {
    deleteMutation.mutate(taskId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setNewTitle(category);
    setNewDescription(description);
  }, [category, description]);

  const handleSaveClick = useCallback(() => {
    updateCategoryMutation.mutate({
      categoryId,
      title: newTitle,
      description: newDescription,
    });
  }, [categoryId, newTitle, newDescription, updateCategoryMutation]);

  const handleCancelClick = useCallback(() => {
    setIsEditing(false);
    setNewTitle(category);
    setNewDescription(description);
  }, [category, description]);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (isCategoryError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error fetching category details
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {isEditing ? (
        <div className="mb-4">
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
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelClick}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-4">{category}</h1>
          <p className="text-gray-700 mb-4">
            {description || "No description provided."}
          </p>
          <button
            onClick={handleEditClick}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            Edit Category
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
        <div>
          <strong>Created:</strong> {new Date(createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>Last Updated:</strong>{" "}
          {new Date(updatedAt).toLocaleDateString()}
        </div>
      </div>
      {/* Remove this block */}
      {/* <Link
        to={`/categories/${categoryId}/edit`}
        className="mb-6 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Edit Category
      </Link> */}

      <h2 className="text-2xl font-bold mt-8 mb-4">Tasks</h2>
      <div className="mb-4 flex gap-4">
        <select
          value={filters.isApproved}
          onChange={(e) => handleFilterChange("isApproved", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>
        <select
          value={filters.isPaid}
          onChange={(e) => handleFilterChange("isPaid", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Payment</option>
          <option value="true">Paid</option>
          <option value="false">Pending</option>
        </select>
        <select
          value={filters.isCompleted}
          onChange={(e) => handleFilterChange("isCompleted", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Completion</option>
          <option value="true">Completed</option>
          <option value="false">Pending</option>
        </select>
      </div>
      {filteredTasks.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 w-[5%]">S/N</th>
                <th className="border p-2 w-[25%]">Title</th>
                <th className="border p-2 w-[15%]">Vendor</th>
                <th className="border p-2 w-[10%]">Amount</th>
                <th className="border p-2 w-[10%]">Status</th>
                <th className="border p-2 w-[10%]">Payment</th>
                <th className="border p-2 w-[10%]">Completion</th>
                <th className="border p-2 w-[15%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr
                  key={task._id}
                  className={`hover:bg-gray-100 ${
                    editingRowId === task._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="border px-2 py-2">{index + 1}</td>
                  <td
                    className="border px-4 py-2 cursor-pointer text-blue-800 font-bold"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    {task.title}
                  </td>
                  <td className="border px-4 py-2">{task.vendor}</td>
                  <td className="border px-4 py-2">
                    ${task.amount.toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <select
                        value={editValues.isApproved.toString()}
                        onChange={(e) =>
                          handleEditChange(
                            "isApproved",
                            e.target.value === "true"
                          )
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="true">Approved</option>
                        <option value="false">Pending</option>
                      </select>
                    ) : (
                      <span
                        className={
                          task.isApproved ? "text-green-600" : "text-yellow-600"
                        }
                      >
                        {task.isApproved ? "Approved" : "Pending"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <select
                        value={editValues.isPaid.toString()}
                        onChange={(e) =>
                          handleEditChange("isPaid", e.target.value === "true")
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="true">Paid</option>
                        <option value="false">Unpaid</option>
                      </select>
                    ) : (
                      <span
                        className={
                          task.isPaid ? "text-green-600" : "text-red-600"
                        }
                      >
                        {task.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <select
                        value={editValues.isCompleted.toString()}
                        onChange={(e) =>
                          handleEditChange(
                            "isCompleted",
                            e.target.value === "true"
                          )
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="true">Completed</option>
                        <option value="false">In Progress</option>
                      </select>
                    ) : (
                      <span
                        className={
                          task.isCompleted
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {task.isCompleted ? "Completed" : "In Progress"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
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
                          onClick={() => startEditing(task)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        >
                          <FiEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
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
      ) : (
        <p className="text-gray-600">No tasks found for this category.</p>
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

export default CategoryDetails;
