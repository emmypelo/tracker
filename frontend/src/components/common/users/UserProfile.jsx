import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAUserApi,
  editUserProfileApi,
  changePasswordApi,
} from "../../../APIrequests/userAPI";
import { useSelector } from "react-redux";

export default function UserProfile() {
  const { userAuth } = useSelector((state) => state.auth);
  const { _id: userId } = userAuth?.data || {};
  const queryClient = useQueryClient();

  // Edit states for individual fields
  const [editingField, setEditingField] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  // Fetch user data
  const {
    data: userData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchAUserApi(userId),
    enabled: !!userId,
    onSuccess: (data) => {
      if (data?.status === "success" && data?.data?.user) {
        const user = data.data.user;
        setProfileForm({
          firstname: user.firstname || "",
          lastname: user.lastname || "",
        });
      }
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updatedData) => editUserProfileApi(userId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId]);
      setEditingField(null);
      showNotification("success", "Profile updated successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to update profile. Please try again.";
      showNotification("error", errorMessage);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwords) => changePasswordApi(userId, passwords),
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      showNotification("success", "Password changed successfully!");
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to change password. Please try again.";
      showNotification("error", errorMessage);
    },
  });

  const user = userData?.data?.user;

  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  // Handle password field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  // Start editing a field
  const startEditing = (field) => {
    setEditingField(field);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    if (user) {
      setProfileForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
      });
    }
  };

  // Save profile changes
  const saveProfileChanges = (field) => {
    const dataToUpdate = { [field]: profileForm[field] };
    updateProfileMutation.mutate(dataToUpdate);
  };

  // Handle password change submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Client-side validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification("error", "New passwords don't match!");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showNotification("error", "Password must be at least 8 characters long");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      {/* Notification Toast */}
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Profile Information */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h2>

                {/* First Name Field */}
                <ProfileField
                  label="First Name"
                  value={user?.firstname}
                  fieldName="firstname"
                  editingField={editingField}
                  formValue={profileForm.firstname}
                  onEdit={startEditing}
                  onCancel={cancelEditing}
                  onSave={saveProfileChanges}
                  onChange={handleProfileChange}
                  isLoading={updateProfileMutation.isPending}
                />

                {/* Last Name Field */}
                <ProfileField
                  label="Last Name"
                  value={user?.lastname}
                  fieldName="lastname"
                  editingField={editingField}
                  formValue={profileForm.lastname}
                  onEdit={startEditing}
                  onCancel={cancelEditing}
                  onSave={saveProfileChanges}
                  onChange={handleProfileChange}
                  isLoading={updateProfileMutation.isPending}
                />

                {/* Email Field (non-editable) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    {user?.email || "Not provided"}
                  </dd>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Account Details
                </h2>

                {/* Role Field */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-2">
                    Role
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        user?.role === "admin"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : user?.role === "manager"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      {user?.role || "user"}
                    </span>
                  </dd>
                </div>

                {/* Account Dates */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">
                    Account Created
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not available"}
                  </dd>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {user?.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not available"}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Security Settings
            </h2>

            {showPasswordForm ? (
              <div className="bg-gray-50 p-6 rounded-lg">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>

                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter your new password (min. 8 characters)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Change Password
                </button>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Field Component
function ProfileField({
  label,
  value,
  fieldName,
  editingField,
  formValue,
  onEdit,
  onCancel,
  onSave,
  onChange,
  isLoading,
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <dt className="text-sm font-medium text-gray-700 mb-2">{label}</dt>
      {editingField === fieldName ? (
        <div>
          <input
            type="text"
            name={fieldName}
            value={formValue}
            onChange={onChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onSave(fieldName)}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dd className="text-sm text-gray-900 flex items-center justify-between">
          <span>{value || "Not provided"}</span>
          <button
            onClick={() => onEdit(fieldName)}
            className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        </dd>
      )}
    </div>
  );
}

// Notification Toast Component
function NotificationToast({ type, message, onClose }) {
  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
          isSuccess
            ? "bg-green-50 border-l-4 border-green-400"
            : isError
            ? "bg-red-50 border-l-4 border-red-400"
            : "bg-blue-50 border-l-4 border-blue-400"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isSuccess ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : isError ? (
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3 w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  isSuccess
                    ? "text-green-800"
                    : isError
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {isSuccess ? "Success!" : isError ? "Error" : "Info"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  isSuccess
                    ? "text-green-700"
                    : isError
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={onClose}
                className={`rounded-md inline-flex ${
                  isSuccess
                    ? "text-green-400 hover:text-green-500 focus:ring-green-600"
                    : isError
                    ? "text-red-400 hover:text-red-500 focus:ring-red-600"
                    : "text-blue-400 hover:text-blue-500 focus:ring-blue-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-8 text-center">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-lg font-medium text-gray-900">
              Loading profile...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Display Component
function ErrorDisplay({ error }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-red-200">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Profile
          </h3>
          <p className="text-sm text-gray-600">
            {error?.response?.data?.message ||
              error?.message ||
              "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
