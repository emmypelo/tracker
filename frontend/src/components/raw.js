import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasksApi } from "../APIrequests/taskAPI";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
import * as XLSX from "xlsx";

const FetchTask = () => {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const {
    isLoading: isTasksLoading,
    isError: isTasksError,
    data: tasksData,
    error: tasksError,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ["fetchTasks"],
    queryFn: () => fetchTasksApi({ ...filters, title: searchTerm }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategories", { ...filters }],
    queryFn: fetchCategoriesApi,
  });

  const handleCategoryFilter = (categoryId) => {
    setFilters({ ...filters, category: categoryId });

    taskRefetch();
  };

  //handle search  handler
  const handleSearchChange = (e) => {
    console.log(e.target.value);
    setSearchTerm(e.target.value);
  };
  //handle submit search term  handler
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, title: searchTerm });

    taskRefetch();
  };

  //handle clear filters   handler
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");

    taskRefetch();
  };

  const [editRowId, setEditRowId] = useState(null);
  const [editedTask, setEditedTask] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (isTasksLoading) {
    return <h2>Loading tasks...</h2>;
  }

  if (isTasksError) {
    return <h2>Error: {tasksError.message || "Something went wrong"}</h2>;
  }

  if (!tasksData?.data?.tasks?.length) {
    return <h2>No tasks found</h2>;
  }

  const tasks = tasksData?.data?.tasks;
  const categories = categoriesData?.data?.categories;

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter tasks based on selected category
  const filteredTasks =
    selectedCategory === "All"
      ? tasks
      : tasks.filter((task) => task.category?.category === selectedCategory);

  const handleEditClick = (task) => {
    setEditRowId(task._id);
    setEditedTask(task);
  };

  const handleInputChange = (e, field) => {
    setEditedTask((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSaveClick = () => {
    console.log("Updated Task:", editedTask); // Implement actual API call here
    setEditRowId(null);
  };

  const handleCancelClick = () => {
    setEditRowId(null);
  };

  const exportToExcel = () => {
    const data = filteredTasks.map((task) => ({
      Title: task.title,
      // Vendor: task.vendor,
      Amount: task.amount,
      // Category: task.category?.category || "Uncategorized",
      // SubCategory: task.subCategory?.title || "Uncategorized",
      // Approved: task.isApproved ? "Approved" : "Pending",
      // Payment: task.isPaid ? "Paid" : "Pending",
      Status: task.isCompleted ? "Completed" : "Pending",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    XLSX.writeFile(workbook, "Tasks.xlsx");
  };

  return (
    <div className="mt-24 lg:mt-28">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Task List</h2>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export to Excel
        </button>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Title</th>
            <th className="border border-gray-300 px-4 py-2">Vendor</th>
            <th className="border border-gray-300 px-4 py-2">Amount</th>
            <th className="border border-gray-300 px-4 py-2">
              <div className="flex items-center">
                <span className="mr-2">Category</span>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="border px-2 py-1 rounded text-sm"
                >
                  <option value="All">All</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              </div>
            </th>
            <th className="border border-gray-300 px-4 py-2">Sub Category</th>
            <th className="border border-gray-300 px-4 py-2">Approved</th>
            <th className="border border-gray-300 px-4 py-2">Payment</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task._id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">{task.title}</td>
              <td className="border border-gray-300 px-4 py-2">
                {task.vendor}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {task.amount}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {task.category?.category || "Uncategorized"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {task.subCategory?.title || "Uncategorized"}
              </td>

              {editRowId === task._id ? (
                <>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={editedTask.isApproved ? "Approved" : "Pending"}
                      onChange={(e) => handleInputChange(e, "isApproved")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value={true}>Approved</option>
                      <option value={false}>Pending</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={editedTask.isPaid ? "Paid" : "Pending"}
                      onChange={(e) => handleInputChange(e, "isPaid")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value={true}>Paid</option>
                      <option value={false}>Pending</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={editedTask.isCompleted ? "Completed" : "Pending"}
                      onChange={(e) => handleInputChange(e, "isCompleted")}
                      className="border rounded px-2 py-1 w-full"
                    >
                      <option value={true}>Completed</option>
                      <option value={false}>Pending</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={handleSaveClick}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="bg-gray-500 text-white px-3 py-1 rounded ml-2"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border border-gray-300 px-4 py-2">
                    {task.isApproved ? "Approved" : "Pending"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {task.isPaid ? "Paid" : "Pending"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {task.isCompleted ? "Completed" : "Pending"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleEditClick(task)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FetchTask;
