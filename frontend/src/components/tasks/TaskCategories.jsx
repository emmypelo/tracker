import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCategoriesApi } from "../../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../../APIrequests/subCategoryAPI";

const TaskCategories = () => {
  const [activeView, setActiveView] = useState("categories");

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const {
    data: subCategoriesData,
    isLoading: isSubCategoriesLoading,
    error: subCategoriesError,
  } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  const categories = categoriesData?.data?.categories || [];
  const subCategories = subCategoriesData?.data?.subCategories || [];

  // if (isCategoriesLoading || isSubCategoriesLoading) {
  //   return <div className="text-center text-gray-600 p-8">Loading...</div>;
  // }

  if (categoriesError || subCategoriesError) {
    return (
      <div className="text-center text-red-600 p-8">
        Error loading data. Please try again later.
      </div>
    );
  }

  const toggleView = (view) => {
    setActiveView(view);
  };

  const renderList = (items) => (
    <ul className="divide-y divide-gray-200">
      {items.map((item) => (
        <li key={item.id || item._id}>
          <Link
            to={`/manage/${
              activeView === "categories" ? "categories" : "subcategories"
            }/${item._id}`}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
          >
            <span className="text-lg text-gray-800">
              {activeView === "categories" ? item.category : item.title}
            </span>
            <div className="flex items-center">
              <span className="bg-gray-200 text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {item.tasks ? item.tasks.length : 0} tasks
              </span>
              <svg
                className="w-5 h-5 text-gray-400 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
        <h2 className="text-2xl font-bold">
          {activeView === "categories"
            ? "Task Categories"
            : "Task Subcategories"}
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => toggleView("categories")}
            className={`px-4 py-2 rounded ${
              activeView === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => toggleView("subcategories")}
            className={`px-4 py-2 rounded ${
              activeView === "subcategories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Subcategories
          </button>
        </div>
      </div>
      {renderList(activeView === "categories" ? categories : subCategories)}
    </div>
  );
};

export default TaskCategories;
