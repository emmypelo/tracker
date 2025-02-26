"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubCategory,
  updateSubCategoryApi,
} from "../../APIrequests/subCategoryAPI";
import { useParams } from "react-router-dom";
import Modal from "../common/Modal";

const SubcategoryDetails = () => {
  const { subCategoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Fetch subcategory data
  const { data: subcategoryData, isError: isSubCategoryError } = useQuery({
    queryKey: ["fetch-subcategory", subCategoryId],
    queryFn: () => fetchSubCategory(subCategoryId),
  });

  // Update subcategory mutation
  const queryClient = useQueryClient();
  const updateSubCategoryMutation = useMutation({
    mutationKey: ["updateSubCategory"],
    mutationFn: updateSubCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["fetch-subcategory", subCategoryId]);
      return { isError: false, message: "Subcategory updated successfully" };
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Subcategory update failed";
      return { isError: true, message: errorMessage };
    },
  });

  const { title, description, createdAt, updatedAt } = useMemo(() => {
    if (subcategoryData) {
      return subcategoryData.data.subCategory;
    }
    return {
      title: "",
      description: "",
      createdAt: "",
      updatedAt: "",
    };
  }, [subcategoryData]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
    setNewTitle(title);
    setNewDescription(description);
  }, [title, description]);

  const handleSaveClick = useCallback(async () => {
    try {
      await updateSubCategoryMutation.mutateAsync({
        subCategoryId,
        title: newTitle,
        description: newDescription,
      });
      setIsError(false);
      setModalMessage("Subcategory updated successfully");
      setIsModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      setIsError(true);
      setModalMessage(error.message || "Failed to update subcategory");
      setIsModalOpen(true);
    }
  }, [subCategoryId, newTitle, newDescription, updateSubCategoryMutation]);

  const handleCancelClick = useCallback(() => {
    setIsEditing(false);
    setNewTitle(title);
    setNewDescription(description);
  }, [title, description]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isSubCategoryError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error fetching subcategory details
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
              Title
            </label>
            <input
              id="title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
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
            Edit Details
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

export default SubcategoryDetails;
