import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "./components/common/ErrorBoundary";
import Loading from "./components/common/Loading";
import Navbar from "./components/common/Navbar";

import "../src/index.css";
import "../src/App.css";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Lazy load all components
const Home = lazy(() => import("./pages/Home"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CreateTaskPage = lazy(() => import("./pages/CreateTaskPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TaskDetailsPage = lazy(() => import("./pages/TaskDetailsPage"));
const AddRegionPage = lazy(() => import("./pages/AddRegionPage"));
const AddStationPage = lazy(() => import("./pages/AddStationPage"));
const CreateReportPage = lazy(() => import("./pages/CreateReportPage"));
const ReportCategoryPage = lazy(() => import("./pages/ReportCategoryPage"));
const FetchReportsPage = lazy(() => import("./pages/FetchReportsPage"));
const ReportDetailsPage = lazy(() => import("./pages/ReportDetailsPage"));
const ManagementLayout = lazy(() =>
  import("./components/common/ManagementLayout")
);

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow mt-16">
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/newtask" element={<CreateTaskPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
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
                    <Route path="addcategory" element={<CategoryPage />} />
                    <Route
                      path="reportcategory"
                      element={<ReportCategoryPage />}
                    />
                    <Route path="addstation" element={<AddStationPage />} />
                    <Route path="addregion" element={<AddRegionPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
