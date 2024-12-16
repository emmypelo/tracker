import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchTasksApi, updateTaskApi } from "../APIrequests/taskAPI";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";
import { FiEdit } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { formatAmount } from "./hooks";

const FetchTask = () => {
  const navigate = useNavigate();
  const [editingRowId, setEditingRowId] = useState(null);
  
  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    title: "",
    isApproved: "",
    isPaid: "",
    isCompleted: "",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    isLoading: isTasksLoading,
    isError: isTasksError,
    data: tasksData,
    error: tasksError,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ["fetchTasks", filters],
    queryFn: () => fetchTasksApi(filters),
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategories"],
    queryFn: fetchCategoriesApi,
  });

  const { data: subCategoriesData } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  const taskMutation = useMutation({
    mutationKey: ["updateTask"],
    mutationFn: updateTaskApi,
    onSuccess: () => {
      setEditingRowId(null);
      taskRefetch();
    },
  });
  const [editValues, setEditValues] = useState({
    isApproved: false,
    isPaid: false,
    isCompleted: false,
    remark: "",
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (task) => {
    setEditingRowId(task._id);
    setEditValues({
      isApproved: task.isApproved,
      isPaid: task.isPaid,
      isCompleted: task.isCompleted,
      progress: task.progress,
    });
  };

  const saveChanges = () => {
    const updateData = {
      ...editValues,
      taskId: editingRowId,
    };
    taskMutation.mutate(updateData);
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({
      isApproved: false,
      isPaid: false,
      isCompleted: false,
      amount: 0,
      progress: 0,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, title: searchTerm });
    taskRefetch();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      subCategory: "",
      title: "",
      isApproved: "",
      isPaid: "",
      isCompleted: "",
      startDate: "",
      endDate: "",
    });
  };


  if (isTasksLoading) return <h2>Loading tasks...</h2>;
  if (isTasksError)
    return <h2>Error: {tasksError?.message || "Something went wrong"}</h2>;

  const tasks = tasksData?.data?.tasks || [];
  const categories = categoriesData?.data?.categories || [];
  const subCategories = subCategoriesData?.data?.subCategories || [];

  return (
    <div className="relative px-1">
      <div className="sticky top-[4.6rem] left-0 right-0 bg-white shadow-md z-30">
        <div className="flex justify-between items-center w-full h-16 px-4 bg-gray-800 text-white">
          <h1 className="text-2xl font-bold">Tasks Dashboard</h1>
          <Link
            to="/newtask"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
          >
            New Task
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb py-6 px-4 sticky top-[8.5rem] z-20 bg-red-200 h-[9rem]">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 ">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border p-2 rounded flex justify-between w-1/2 md:w-1/4"
          />
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="border p-2 rounded hidden md:inline appearance-none"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.category}
              </option>
            ))}
          </select>
          <select
            value={filters.subCategory}
            onChange={(e) => handleFilterChange("subCategory", e.target.value)}
            className="border p-2 rounded hidden md:inline appearance-none"
          >
            <option value="">All SubCategories</option>
            {subCategories?.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.title}
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
            value={filters.isApproved}
            onChange={(e) => handleFilterChange("isApproved", e.target.value)}
            className="border p-2 rounded appearance-none"
          >
            <option value="">Approval</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filters.isPaid}
            onChange={(e) => handleFilterChange("isPaid", e.target.value)}
            className="border p-2 rounded appearance-none"
          >
            <option value="">Payment</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filters.isCompleted}
            onChange={(e) => handleFilterChange("isCompleted", e.target.value)}
            className="border p-2 rounded appearance-none"
          >
            <option value="">Completion</option>
            <option value="true">Completed</option>
            <option value="false">Pending</option>
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

      {tasks.length === 0 ? (
        <div>No tasks found</div>
      ) : (
        <div
          className="
        
        "
        >
          <table
            className="w-full border-collapse border border-gray-300 bg-red-300"
            // style={{ tableLayout: "fixed" }}
          >
            <thead className="">
              <tr className="sticky top-[17rem] bg-blue-300 text-sm">
                <th className="border p-1 w-[5%]">S/N</th>
                <th className="sticky top-[16rem]border p-1 w-[20%]">Title</th>
                <th className="border p-1 w-[15%]">Amount</th>
                <th className="border p-1 w-[15%] hidden md:table-cell">
                  Category
                </th>
                <th className="border p-1 w-[15%] hidden md:table-cell">
                  SubCategory
                </th>
                <th className="border p-1 w-[13%]">Approved</th>
                <th className="border p-1 w-[10%]">Paid</th>
                <th className="border p-1 w-[10%]">Progress</th>
                <th className="border p-1 w-[10%]">Completed</th>
                <th className="border p-1 w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={task._id}
                  className={`hover:bg-gray-100 text-sm md:text-base ${
                    editingRowId === task._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="border px-1 py-2">{index + 1}</td>
                  <td
                    className="border px-4 py-2"
                    onClick={() => navigate(`/tasks/${task?._id}`)}
                  >
                    {task.title}
                  </td>
                  <td className="border px-4 py-2">
                    {formatAmount(task.amount)}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {task.category?.category || "Uncategorized"}
                  </td>
                  <td className="border px-4 py-2 hidden md:table-cell">
                    {task.subCategory?.title || "Uncategorized"}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <div className="flex items-center justify-center">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={editValues.isApproved}
                              onChange={(e) =>
                                handleEditChange("isApproved", e.target.checked)
                              }
                            />
                            <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                            <div
                              className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${
                                editValues.isApproved
                                  ? "transform translate-x-full bg-green-500"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <span
                        className={
                          task.isApproved ? "text-green-500" : "text-red-500"
                        }
                      >
                        {task.isApproved ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <div className="flex items-center justify-center">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={editValues.isPaid}
                              onChange={(e) =>
                                handleEditChange("isPaid", e.target.checked)
                              }
                            />
                            <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                            <div
                              className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${
                                editValues.isPaid
                                  ? "transform translate-x-full bg-green-500"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <span
                        className={
                          task.isPaid ? "text-green-500" : "text-red-500"
                        }
                      >
                        {task.isPaid ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <input
                        type="number"
                        value={editValues.progress}
                        onChange={(e) =>
                          handleEditChange(
                            "progress",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-1 border rounded"
                        min="0"
                        max="100"
                      />
                    ) : (
                      `${task.progress}%`
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <div className="flex items-center justify-center">
                        <label className="flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={editValues.isCompleted}
                              onChange={(e) =>
                                handleEditChange(
                                  "isCompleted",
                                  e.target.checked
                                )
                              }
                            />
                            <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                            <div
                              className={`absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${
                                editValues.isCompleted
                                  ? "transform translate-x-full bg-green-500"
                                  : ""
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <span
                        className={
                          task.isCompleted ? "text-green-500" : "text-red-500"
                        }
                      >
                        {task.isCompleted ? "Yes" : "No"}
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === task._id ? (
                      <div className="flex justify-around space-x-2">
                        <button
                          onClick={saveChanges}
                          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-1"
                        >
                          <IoCheckmarkDoneSharp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdOutlineCancel className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <button
                          onClick={() => startEditing(task)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        >
                          <FiEdit className="w-5 h-5" />
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
    </div>
  );
};

export default FetchTask;
