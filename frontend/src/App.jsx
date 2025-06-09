
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "./components/common/ErrorBoundary";
import Navbar from "./components/common/Navbar";

import Home from "./pages/Home";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import CreateTaskPage from "./pages/CreateTaskPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TaskDetailsPage from "./pages/TaskDetailsPage";
import AddRegionPage from "./pages/AddRegionPage";
import AllStationsPage from "./pages/AllStationsPage";
import CreateReportPage from "./pages/CreateReportPage";
import ReportCategoryPage from "./pages/ReportCategoryPage";
import FetchReportsPage from "./pages/FetchReportsPage";
import ReportDetailsPage from "./pages/ReportDetailsPage";
import ManagementLayout from "./components/common/ManagementLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import TaskCategoriesPage from "./pages/TaskCategoriesPage";
import TaskCategoryDetailsPage from "./pages/TaskCategoryDetailsPage";
import TaskSubcategoryDetailsPage from "./pages/TaskSubcategoryDetailsPage";
import Allusers from "./components/common/users/Allusers";
import UserProfilePage from "./pages/UserProfilePage";

import "../src/index.css";
import "../src/App.css";

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true, // Enable the future flag
        }}
      >
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow mt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/newtask" element={<CreateTaskPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/reset-password/:verifyToken"
                element={<ResetPasswordPage />}
              />
              <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
              <Route path="/report" element={<CreateReportPage />} />
              <Route path="/reports" element={<FetchReportsPage />} />
              <Route
                path="/reports/:reportId"
                element={<ReportDetailsPage />}
              />

              {/* Protected management routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/manage" element={<ManagementLayout />}>
                  <Route
                    path="reportcategory"
                    element={<ReportCategoryPage />}
                  />
                  <Route path="stations" element={<AllStationsPage />} />
                  <Route path="addregion" element={<AddRegionPage />} />
                  <Route path="categories" element={<TaskCategoriesPage />} />
                  <Route path="users" element={<Allusers />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route
                    path="categories/:categoryId"
                    element={<TaskCategoryDetailsPage />}
                  />
                  <Route
                    path="subcategories/:subCategoryId"
                    element={<TaskSubcategoryDetailsPage />}
                  />
                </Route>
              </Route>
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
