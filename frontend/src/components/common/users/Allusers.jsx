"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteUserApi,
  fetchAllUsersApi,
  adminEditUserApi,
} from "../../../APIrequests/userAPI.js";
import { FiEdit } from "react-icons/fi";
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
  const [editingRowId, setEditingRowId] = useState(null);
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

  const userMutation = useMutation({
    mutationKey: ["updateUser"],
    mutationFn: adminEditUserApi,
    onSuccess: () => {
      setEditingRowId(null);
      queryClient.invalidateQueries(["fetchUsers", filters]);
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
    try {
      await deleteMutation.mutateAsync(userToDelete);
      setIsError(false);
      setModalMessage("User deleted successfully");
    } catch (error) {
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
    } finally {
      setIsModalOpen(false);
      setUserToDelete(null);
    }
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
    setEditingRowId(user._id);
    setEditValues({
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    });
  };

  const saveChanges = async () => {
    if (!isAuthenticated) {
      navigate("/signin", { state: { from: location } });
      return;
    }
    try {
      await userMutation.mutateAsync({
        userId: editingRowId,
        userData: editValues,
      });
      setIsError(false);
      setModalMessage("User updated successfully");
      setIsModalOpen(true);
    } catch (error) {
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
    } finally {
      setEditingRowId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isError) {
      navigate("/");
    }
  };

  const cancelEditing = () => {
    setEditingRowId(null);
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

  const renderSkeletonRows = (count = 5) => {
    return Array.from({ length: count }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="border px-1 py-2">
          <div className="h-4 bg-gray-200 rounded w-6 mx-auto" />
        </td>
        <td className="border px-4 py-2">
          <div className="h-4 bg-gray-200 rounded" />
        </td>
        <td className="border px-4 py-2">
          <div className="h-4 bg-gray-200 rounded" />
        </td>
        <td className="border px-4 py-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
        <td className="border px-4 py-2">
          <div className="flex gap-2 justify-center">
            <div className="h-6 w-6 bg-gray-200 rounded-full" />
            <div className="h-6 w-6 bg-gray-200 rounded-full" />
          </div>
        </td>
      </tr>
    ));
  };

  if (isUsersError)
    return (
      <h2 className="text-red-600 text-center py-4">
        Error: {usersError?.message || "Something went wrong"}
      </h2>
    );

  return (
    <div className="relative px-1">
      <div className="sticky top-[4.6rem] left-0 right-0 bg-white shadow-md z-30">
        <div className="flex justify-between items-center w-full h-16 px-4 bg-gray-800 text-white">
          <h1 className="text-l font-bold">Users</h1>
        </div>
      </div>

      <div className="sticky top-[4.6rem] z-20 bg-gray-100 h-16 border-b border-gray-200">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 h-full px-4"
        >
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 w-10 flex items-center justify-center bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="sticky top-[rem] bg-gray-200 text-sm">
              <th className="border p-1 w-[5%]">S/N</th>
              <th className="border p-1">First Name</th>
              <th className="border p-1">Last Name</th>
              <th className="border p-1">Role</th>
              <th className="border p-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              renderSkeletonRows()
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user._id}
                  className={`hover:bg-gray-100 text-sm md:text-base h-12 ${
                    editingRowId === user._id ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="border px-1 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">
                    {editingRowId === user._id ? (
                      <input
                        type="text"
                        value={editValues.firstname}
                        onChange={(e) =>
                          handleEditChange("firstname", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      />
                    ) : (
                      user.firstname
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === user._id ? (
                      <input
                        type="text"
                        value={editValues.lastname}
                        onChange={(e) =>
                          handleEditChange("lastname", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      />
                    ) : (
                      user.lastname
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === user._id ? (
                      <select
                        value={editValues.role}
                        onChange={(e) =>
                          handleEditChange("role", e.target.value)
                        }
                        className="w-full p-1 border rounded h-8"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {editingRowId === user._id ? (
                      <div className="flex justify-between items-center h-8">
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
                      <div className="flex justify-between items-center h-8 gap-2">
                        <button
                          onClick={() => startEditing(user)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                        >
                          <FiEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <MdDelete className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default AllUsers;
