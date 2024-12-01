import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTasksApi } from "../APIrequests/taskAPI";
import { fetchCategoriesApi } from "../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../APIrequests/subCategoryAPI";

const FetchTask = () => {
  const [filters, setFilters] = useState({
    category: "",
    subCategory: "",
    title: "",
    isApproved: "",
    isPaid: "",
    isCompleted: "",
  });

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

  // Refetch tasks whenever filters change
  useEffect(() => {
    taskRefetch();
  }, [filters, taskRefetch]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const [searchTerm, setSearchTerm] = useState("");
  //handle search handler
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
    });
  };

  if (isTasksLoading) return <h2>Loading tasks...</h2>;
  if (isTasksError)
    return <h2>Error: {tasksError.message || "Something went wrong"}</h2>;
  if (!tasksData?.data?.tasks?.length) return <h2>No tasks found</h2>;

  const tasks = tasksData?.data?.tasks;
  const categories = categoriesData?.data?.categories;
  const subCategories = subCategoriesData?.data?.subCategories;

  return (
    <div className="mt-24 lg:mt-28">
      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={handleSearchChange}
            className="border p-2 rounded"
          />
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="border p-2 rounded"
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
            className="border p-2 rounded"
          >
            <option value="">All SubCategories</option>
            {subCategories?.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.title}
              </option>
            ))}
          </select>
          <select
            value={filters.isApproved}
            onChange={(e) => handleFilterChange("isApproved", e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Approval Status</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filters.isPaid}
            onChange={(e) => handleFilterChange("isPaid", e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Payment Status</option>
            <option value="true">Paid</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filters.isCompleted}
            onChange={(e) => handleFilterChange("isCompleted", e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Completion Status</option>
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

      {/* Table Section */}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Category</th>
            <th className="border px-4 py-2">SubCategory</th>
            <th className="border px-4 py-2">Approved</th>
            <th className="border px-4 py-2">Paid</th>
            <th className="border px-4 py-2">Completed</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{task.title}</td>
              <td className="border px-4 py-2">
                {task.category?.category || "Uncategorized"}
              </td>
              <td className="border px-4 py-2">
                {task.subCategory?.title || "Uncategorized"}
              </td>
              <td className="border px-4 py-2">
                {task.isApproved ? "Yes" : "No"}
              </td>
              <td className="border px-4 py-2">{task.isPaid ? "Yes" : "No"}</td>
              <td className="border px-4 py-2">
                {task.isCompleted ? "Yes" : "No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FetchTask;
