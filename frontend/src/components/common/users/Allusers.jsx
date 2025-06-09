"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUserApi,
  fetchAllUsersApi,
  adminEditUserApi,
} from "../../../APIrequests/userAPI.js";
import { FiEdit, FiUser } from "react-icons/fi";
import { MdOutlineCancel, MdDelete } from "react-icons/md";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../../common/Modal";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import { Search, X } from "lucide-react";

const AllUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userAuth } = useSelector((state) => state.auth);
  const isAuthenticated = userAuth?.data?.isAuthenticated === true;

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [isError, setIsError] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [filters, setFilters] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedFetchUsers = useCallback(
    debounce((newFilters) => {
      queryClient.invalidateQueries(["fetchUsers", newFilters]);
    }, 300),
    []
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedFetchUsers(newFilters);
  };

  const {
    isLoading,
    isError: isUsersError,
    data: usersData,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["fetchUsers", filters],
    queryFn: () => fetchAllUsersApi(filters),
    keepPreviousData: true,
  });

  // Fixed mutation function
  const userMutation = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: ({ userId, userData }) => adminEditUserApi(userId, userData),
    onSuccess: () => {
      setEditingUserId(null);
      queryClient.invalidateQueries(["fetchUsers", filters]);
      setModalMessage("User updated successfully");
      setIsError(false);
      setIsModalOpen(true);
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "User update failed";
      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["deleteUser"],
    mutationFn: deleteUserApi,
    onSuccess: () => {
      setIsError(false);
      setModalMessage("User deleted successfully");
      setIsModalOpen(true);
      refetchUsers();
    },
    onError: (error) => {
      setIsError(true);
      let errorMessage = "Deleting failed";
      if (error.response?.status === 401 || error.message.includes("401")) {
        navigate("/signin", { state: { from: location } });
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setModalMessage(errorMessage);
      setIsModalOpen(true);
    },
  });

  const handleDelete = async (userId) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setUserToDelete(userId);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    await deleteMutation.mutateAsync(userToDelete);
    setUserToDelete(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const [editValues, setEditValues] = useState({
    firstname: "",
    lastname: "",
    role: "",
  });

  const handleEditChange = (key, value) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const startEditing = (user) => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    setEditingUserId(user._id);
    setEditValues({
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    });
  };

  // Fixed saveChanges function
  const saveChanges = async () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }

    // Use the mutation instead of direct API call
    await userMutation.mutateAsync({
      userId: editingUserId,
      userData: editValues,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError) {
      // Don't navigate away after successful update
      // navigate("/");
    }
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditValues({
      firstname: "",
      lastname: "",
      role: "",
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange("name", searchTerm);
  };

  const clearFilters = () => {
    setSearchTerm("");
    const clearedFilters = { name: "" };
    setFilters(clearedFilters);
    debouncedFetchUsers(clearedFilters);
  };

  const users = usersData?.data?.users || [];
  const roles = ["admin", "user"];

  const LoadingSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 animate-pulse"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isUsersError)
    return (
      <h2 className="text-red-600 text-center py-4">
        Error: {usersError?.message || "Something went wrong"}
      </h2>
    );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">User Management</h1>
            <div className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-medium text-blue-600">{users.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Fixed */}
      <div className="flex-shrink-0 bg-white border-b">
        <div className="px-4 py-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="h-10 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Search</span>
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="h-10 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Clear</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                  editingUserId === user._id
                    ? "ring-2 ring-blue-500 border-blue-200"
                    : "border-gray-200"
                }`}
              >
                {editingUserId === user._id ? (
                  // Edit Mode
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editValues.firstname}
                          onChange={(e) =>
                            handleEditChange("firstname", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editValues.lastname}
                          onChange={(e) =>
                            handleEditChange("lastname", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={editValues.role}
                          onChange={(e) =>
                            handleEditChange("role", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveChanges}
                          disabled={userMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <IoCheckmarkDoneSharp className="w-4 h-4" />
                          <span className="text-sm">
                            {userMutation.isPending ? "Saving..." : "Save"}
                          </span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                          <MdOutlineCancel className="w-4 h-4" />
                          <span className="text-sm">Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.firstname} {user.lastname}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>

                    <div className="flex justify-end items-center">
                      <div className="flex gap-8">
                        <button
                          onClick={() => startEditing(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                          title="Edit user"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                          title="Delete user"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isError ? "Error" : "Success"}
        isDeleteAction={!!userToDelete}
        onDelete={confirmDelete}
        onCancel={cancelDelete}
        deleteConfirmationText="Are you sure you want to delete this user? This action cannot be undone."
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

export default AllUsers;
