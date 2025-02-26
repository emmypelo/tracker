"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAcategory,
  updateCategoryApi,
} from "../../APIrequests/categoryAPI";
import { useParams } from "react-router-dom";
import Modal from "../common/Modal";

const CategoryDetails = () => {
  const { categoryId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Fetch category data
  const {
    data: categoryData,
    isLoading,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["fetch-Category", categoryId],
    queryFn: () => fetchAcategory(categoryId),
  });

  // Update category mutation
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
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Category update failed";
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const { category, description, createdAt, updatedAt } = useMemo(() => {
    if (categoryData) {
      return categoryData.data.category;
    }
    return {
      category: "",
      description: "",
      createdAt: "",
      updatedAt: "",
    };
  }, [categoryData]);

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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isCategoryError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-600">Error fetching category details</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Title
            </label>
            <input
              id="title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category title"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category description"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelClick}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{category}</h1>
            <p className="mt-2 text-gray-600">
              {description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(updatedAt).toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={handleEditClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Edit Category
          </button>
        </div>
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
