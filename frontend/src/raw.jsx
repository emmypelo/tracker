import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasksApi } from "../APIrequests/taskAPI";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
// import { fetchcategoriesApi } from "../APIrequests/categoryAPI";

const FetchTask = () => {
  const {
    isLoading: isTasksLoading,
    isError: isTasksError,
    data: tasksData,
    error: tasksError,
  } = useQuery({
    queryKey: ["fetchTasks"],
    queryFn: fetchTasksApi,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["fetchCategories"],
    queryFn: fetchCategoriesApi,
  });

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

  return (
    <div className="mt-24 lg:mt-28">
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
