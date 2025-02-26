import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchCategoriesApi } from "../../APIrequests/categoryAPI";
import { fetchSubCategoriesApi } from "../../APIrequests/subCategoryAPI";

const TaskCategories = () => {
  const [activeView, setActiveView] = useState("categories");

  const { data: categoriesData, error: categoriesError } = useQuery({
    queryKey: ["fetchCategory"],
    queryFn: fetchCategoriesApi,
  });

  const { data: subCategoriesData, error: subCategoriesError } = useQuery({
    queryKey: ["fetchSubCategories"],
    queryFn: fetchSubCategoriesApi,
  });

  const categories = categoriesData?.data?.categories || [];
  const subCategories = subCategoriesData?.data?.subCategories || [];

  if (categoriesError || subCategoriesError) {
    return (
      <div className="text-center text-red-600 p-4 sm:p-8">
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
            className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
          >
            <span className="text-base sm:text-lg text-blue-800">
              {activeView === "categories" ? item.category : item.title}
            </span>
            <div className="flex items-center">
              <span className="bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full">
                {item.tasks ? item.tasks.length : 0} tasks
              </span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2"
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
    <div className="max-w-full sm:max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 bg-gray-50 border-b">
        <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          {activeView === "categories"
            ? "Task Categories"
            : "Task Subcategories"}
        </h2>
        <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-0">
          <button
            onClick={() => toggleView("categories")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base ${
              activeView === "categories"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => toggleView("subcategories")}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded text-sm sm:text-base ${
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
